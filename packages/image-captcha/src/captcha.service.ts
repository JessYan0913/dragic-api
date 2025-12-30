import { sign, verify } from 'jsonwebtoken';
import { nanoid } from 'nanoid';

import { CaptchaError, CaptchaNotFoundError, StorageError, ValidationError } from './core/errors';
import { createPuzzle } from './core/puzzle-generator';
import { verifyHumanLikeTrail } from './core/trail-verifier';
import {
  CaptchaConfig,
  CaptchaData,
  CaptchaServiceInterface,
  CreateCaptchaPayload,
  CreateCaptchaResult,
  VerifyCaptchaResult,
  VerifyTrailPayload,
} from './types';

interface TokenPayload {
  id: string;
  purpose: string;
}

export class CaptchaService implements CaptchaServiceInterface {
  constructor(private config: CaptchaConfig) {}

  async createCaptcha(options: CreateCaptchaPayload): Promise<CreateCaptchaResult> {
    const {
      bgWidth = this.config.defaultSize.width,
      bgHeight = this.config.defaultSize.height,
      width = 60,
      height = 60,
      purpose,
    } = options;

    const imgPath = await this.config.imageLoader.pickRandomImagePath();

    const puzzle = await createPuzzle({
      imgUrl: imgPath,
      bgWidth,
      bgHeight,
      width,
      height,
    });

    const id = nanoid();
    const key = `captcha:${id}:data`;
    const data: CaptchaData = { x: puzzle.x, purpose };
    await this.config.storage.set(key, JSON.stringify(data), this.config.ttl);

    const bgMime = 'image/jpeg';
    const puzzleMime = 'image/svg+xml';
    const bgUrl = `data:${bgMime};base64,${puzzle.bg.toString('base64')}`;
    const puzzleUrl = `data:${puzzleMime};base64,${puzzle.puzzle.toString('base64')}`;

    return { id, bgUrl, puzzleUrl };
  }

  async verifyCaptcha(body: VerifyTrailPayload): Promise<VerifyCaptchaResult> {
    if (!body || !Array.isArray(body.trail)) {
      throw new ValidationError('Invalid captcha payload');
    }

    const result = verifyHumanLikeTrail(body);

    let expectedXFromStore: number | null = null;
    let storedPurpose: string | null = null;
    const id = body.id;
    try {
      const key = `captcha:${id}:data`;
      const stored = await this.config.storage.get(key);
      if (stored != null) {
        const data: CaptchaData = JSON.parse(stored);
        expectedXFromStore = data.x;
        storedPurpose = data.purpose;
      }
    } catch (error) {
      throw new StorageError(`Failed to retrieve captcha data: ${error}`);
    }

    // 当服务端存有期望值时，严格比对
    if (expectedXFromStore != null && Number.isFinite(body.x)) {
      const diff = Math.abs(body.x - expectedXFromStore);
      if (diff > this.config.trailTolerance) {
        throw new CaptchaError('expected_x_mismatch', 'EXPECTED_X_MISMATCH');
      }
    } else {
      // 未找到或已过期
      throw new CaptchaNotFoundError();
    }

    // 轨迹判定不通过
    if (!result.ok) {
      // 将判定原因透出到错误 message，code 标记为通用失败
      const reason = result.reasons?.[0] ?? 'verification_failed';
      throw new CaptchaError(reason, 'VERIFICATION_FAILED');
    }

    if (storedPurpose) {
      try {
        await this.config.storage.del(`captcha:${id}:data`);
      } catch (error) {
        throw new StorageError(`Failed to delete captcha data: ${error}`);
      }
    }
    const token = sign({ id, purpose: storedPurpose || '' }, this.config.secret, {
      expiresIn: `${Math.floor(this.config.ttl / 60)}m`,
    });
    return { id, token };
  }

  async verifyToken(id: string, token: string, purpose: string): Promise<boolean> {
    const result = verify(token, this.config.secret);
    const payload = result as TokenPayload;
    return payload.id === id && payload.purpose === purpose;
  }
}