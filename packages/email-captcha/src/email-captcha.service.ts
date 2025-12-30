import { Injectable, Inject, Optional } from '@nestjs/common';
import { sign, verify } from 'jsonwebtoken';
import { nanoid } from 'nanoid';
import { MailService } from '@dragic/mail';

import { CaptchaError, CaptchaNotFoundError, StorageError, ValidationError } from './core/errors';
import {
  EmailCaptchaConfig,
  EmailCaptchaServiceInterface,
  SendEmailCaptchaPayload,
  SendEmailCaptchaResult,
  VerifyEmailCaptchaPayload,
  VerifyEmailCaptchaResult,
} from './types';

interface TokenPayload {
  id: string;
  purpose: string;
}

@Injectable()
export class EmailCaptchaService implements EmailCaptchaServiceInterface {
  constructor(
    private config: EmailCaptchaConfig,
    @Optional() private mailService?: MailService
  ) {
    if (!config.storage) {
      throw new Error('Storage service must be provided');
    }
    if (!config.secret) {
      throw new Error('JWT secret must be provided');
    }
  }

  async sendCaptcha(options: SendEmailCaptchaPayload): Promise<SendEmailCaptchaResult> {
    const { email, purpose, text, action } = options;

    if (!email || !purpose || !text || !action) {
      throw new ValidationError('Email, purpose, text and action are required');
    }

    const code = this.generateCode();
    const id = nanoid();
    const key = `email-captcha:${id}`;

    try {
      await this.config.storage.set(key, JSON.stringify({ code, purpose }), this.config.ttl);
    } catch (error) {
      throw new StorageError(`Failed to store captcha: ${error}`);
    }

    // 发送邮件
    if (this.mailService) {
      try {
        const subject = `验证码：${code}`;
        const html = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #333;">${action}</h2>
            <p style="font-size: 16px; color: #666;">${text}</p>
            <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0;">
              <span style="font-size: 24px; font-weight: bold; color: #007bff; letter-spacing: 3px;">${code}</span>
            </div>
            <p style="font-size: 14px; color: #999;">
              此验证码将在 ${Math.floor(this.config.ttl / 60)} 分钟后失效，请及时使用。
            </p>
            <p style="font-size: 12px; color: #ccc; margin-top: 30px;">
              如非本人操作，请忽略此邮件。
            </p>
          </div>
        `;
        const textBody = `${text}\n\n验证码：${code}\n\n此验证码将在 ${Math.floor(this.config.ttl / 60)} 分钟后失效，请及时使用。\n\n如非本人操作，请忽略此邮件。`;
        
        const result = await this.mailService.sendMail({
          to: email,
          subject,
          html,
          text: textBody
        });
        
        if (!result.success) {
          throw new CaptchaError('Failed to send email', 'EMAIL_SEND_FAILED');
        }
      } catch (error) {
        throw new CaptchaError(`Failed to send email: ${error.message}`, 'EMAIL_SEND_FAILED');
      }
    }

    return { id };
  }

  async verifyCaptcha(options: VerifyEmailCaptchaPayload): Promise<VerifyEmailCaptchaResult> {
    const { id, code, purpose } = options;

    if (!id || !code || !purpose) {
      throw new ValidationError('ID, code and purpose are required');
    }

    const key = `email-captcha:${id}`;
    let stored;

    try {
      stored = await this.config.storage.get(key);
    } catch (error) {
      throw new StorageError(`Failed to retrieve captcha: ${error}`);
    }

    if (!stored) {
      throw new CaptchaNotFoundError();
    }

    const data = JSON.parse(stored);

    if (data.code !== code) {
      throw new CaptchaError('Invalid code', 'CODE_MISMATCH');
    }

    if (data.purpose !== purpose) {
      throw new CaptchaError('Purpose mismatch', 'PURPOSE_MISMATCH');
    }

    try {
      await this.config.storage.del(key);
    } catch (error) {
      throw new StorageError(`Failed to delete captcha: ${error}`);
    }

    const token = sign({ id, purpose }, this.config.secret, { expiresIn: `${Math.floor(this.config.ttl / 60)}m` });

    return { id, token };
  }

  async verifyToken(id: string, token: string, purpose: string): Promise<boolean> {
    const result = verify(token, this.config.secret);
    const payload = result as TokenPayload;
    return payload.id === id && payload.purpose === purpose;
  }

  private generateCode(): string {
    const length = this.config.codeLength || 6;
    return Array.from({ length }, () => Math.floor(Math.random() * 10)).join('');
  }
}