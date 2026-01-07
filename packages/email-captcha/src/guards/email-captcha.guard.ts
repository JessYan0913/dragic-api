import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { EMAIL_CAPTCHA_PURPOSE_KEY } from './decorators';
import { 
  EmailCaptchaTokenMissingException, 
  EmailCaptchaTokenInvalidException, 
  EmailCaptchaTokenExpiredException 
} from './exceptions';
import { EmailCaptchaService } from '../email-captcha.service';

@Injectable()
export class EmailCaptchaGuard implements CanActivate {
  constructor(
    private readonly emailCaptchaService: EmailCaptchaService,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const purpose = this.reflector.get<string>(EMAIL_CAPTCHA_PURPOSE_KEY, context.getHandler()) || 
                   this.reflector.get<string>(EMAIL_CAPTCHA_PURPOSE_KEY, context.getClass()) ||
                   'default';

    const request = context.switchToHttp().getRequest();
    const headerName = 'x-email-captcha-token';
    const cookieName = 'email_captcha_token';
    
    // 优先从请求头获取 token，其次从 Cookie 获取
    let token = request.headers[headerName];
    let captchaId = request.headers['x-email-captcha-id'];
    
    // 如果请求头没有，尝试从 Cookie 获取
    if (!token && request.cookies && request.cookies[cookieName]) {
      token = request.cookies[cookieName];
      // 从 Cookie 获取时，需要从 token 中解析出 captchaId
      try {
        const parts = token.split('.');
        if (parts.length === 3) {
            const decoded = JSON.parse(Buffer.from(parts[1], 'base64').toString());
            captchaId = decoded.id;
        }
      } catch (error) {
        // 如果解析失败，继续使用请求头中的 captchaId (如果有)
      }
    }
    
    if (!token) {
      throw new EmailCaptchaTokenMissingException();
    }

    // 如果还没有 ID，尝试从 token 解析
    if (!captchaId) {
        try {
            const parts = token.split('.');
            if (parts.length === 3) {
                const decoded = JSON.parse(Buffer.from(parts[1], 'base64').toString());
                captchaId = decoded.id;
            }
        } catch (error) {
            // ignore
        }
    }

    if (!captchaId) {
      throw new EmailCaptchaTokenMissingException();
    }

    try {
      const isValid = await this.emailCaptchaService.verifyToken(captchaId, token, purpose);
      
      if (!isValid) {
        throw new EmailCaptchaTokenInvalidException();
      }

      return true;
    } catch (error) {
      if (error instanceof EmailCaptchaTokenMissingException || 
          error instanceof EmailCaptchaTokenInvalidException || 
          error instanceof EmailCaptchaTokenExpiredException) {
        throw error;
      }
      
      throw new EmailCaptchaTokenInvalidException(error.message);
    }
  }
}
