import { Injectable, Inject, Optional, Logger } from '@nestjs/common';
import { sign, verify } from 'jsonwebtoken';
import { randomBytes } from 'crypto';
import { MailService } from '@dragic/mail';

import { CaptchaError, CaptchaNotFoundError, StorageError, ValidationError } from './errors/email-captcha.errors';
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
  private readonly logger = new Logger(EmailCaptchaService.name);

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

    this.logger.log(`发送邮件验证码到: ${email}, 用途: ${purpose}`);

    if (!email || !purpose || !text || !action) {
      throw new ValidationError('Email, purpose, text and action are required');
    }

    const code = this.generateCode();
    const id = randomBytes(16).toString('hex');
    const key = `email-captcha:${id}`;

    try {
      await this.config.storage.set(key, JSON.stringify({ code, purpose }), this.config.ttl);
      this.logger.log(`验证码已存储，ID: ${id}, TTL: ${this.config.ttl}秒`);
    } catch (error) {
      this.logger.error(`存储验证码失败: ${error}`);
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
        
        const messageId = await this.mailService.sendMail({
          to: email,
          subject,
          html,
          text: textBody
        });
        this.logger.log(`邮件发送成功: ${messageId}`);
      } catch (error) {
        this.logger.error(`邮件发送失败: ${error.message}`);
        throw new CaptchaError(`Failed to send email: ${error.message}`, 'EMAIL_SEND_FAILED');
      }
    } else {
      this.logger.warn(`邮件服务未配置，仅生成验证码`);
    }

    return { id };
  }

  async verifyCaptcha(options: VerifyEmailCaptchaPayload): Promise<VerifyEmailCaptchaResult> {
    const { id, code, purpose } = options;

    this.logger.log(`验证验证码，ID: ${id}, 用途: ${purpose}`);

    if (!id || !code || !purpose) {
      throw new ValidationError('ID, code and purpose are required');
    }

    const key = `email-captcha:${id}`;
    let stored;

    try {
      stored = await this.config.storage.get(key);
    } catch (error) {
      this.logger.error(`获取验证码失败: ${error}`);
      throw new StorageError(`Failed to retrieve captcha: ${error}`);
    }

    if (!stored) {
      this.logger.warn(`验证码不存在或已过期: ${id}`);
      throw new CaptchaNotFoundError();
    }

    const data = JSON.parse(stored);

    if (data.code !== code) {
      this.logger.warn(`验证码不匹配: ${id}`);
      throw new CaptchaError('Invalid code', 'CODE_MISMATCH');
    }

    if (data.purpose !== purpose) {
      this.logger.warn(`验证码用途不匹配: ${id}`);
      throw new CaptchaError('Purpose mismatch', 'PURPOSE_MISMATCH');
    }

    try {
      await this.config.storage.del(key);
      this.logger.log(`验证码已删除: ${id}`);
    } catch (error) {
      this.logger.error(`删除验证码失败: ${error}`);
      throw new StorageError(`Failed to delete captcha: ${error}`);
    }

    const token = sign({ id, purpose }, this.config.secret, { expiresIn: `${Math.floor(this.config.ttl / 60)}m` });
    this.logger.log(`验证码验证成功，生成token: ${id}`);

    return { id, token };
  }

  async verifyToken(id: string, token: string, purpose: string): Promise<boolean> {
    this.logger.log(`验证token: ${id}, 用途: ${purpose}`);
    
    try {
      const result = verify(token, this.config.secret);
      const payload = result as TokenPayload;
      const isValid = payload.id === id && payload.purpose === purpose;
      
      if (isValid) {
        this.logger.log(`Token验证成功: ${id}`);
      } else {
        this.logger.warn(`Token验证失败: ${id}`);
      }
      
      return isValid;
    } catch (error) {
      this.logger.error(`Token验证异常: ${error.message}`);
      return false;
    }
  }

  private generateCode(): string {
    const length = this.config.codeLength || 6;
    return Array.from({ length }, () => Math.floor(Math.random() * 10)).join('');
  }
}