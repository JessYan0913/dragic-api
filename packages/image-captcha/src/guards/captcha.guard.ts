import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { CAPTCHA_PURPOSE_KEY } from './decorators';
import { 
  CaptchaTokenMissingException, 
  CaptchaTokenInvalidException, 
  CaptchaTokenExpiredException 
} from './exceptions';

@Injectable()
export class CaptchaGuard implements CanActivate {
  constructor(
    private readonly imageCaptchaService: any,
    private readonly reflector: Reflector,
    private readonly options: {
      headerName?: string;
      cookieName?: string;
      defaultPurpose?: string;
    } = {}
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const purpose = this.reflector.get<string>(CAPTCHA_PURPOSE_KEY, context.getHandler()) || 
                   this.reflector.get<string>(CAPTCHA_PURPOSE_KEY, context.getClass()) ||
                   this.options.defaultPurpose || 'default';

    const request = context.switchToHttp().getRequest();
    const headerName = this.options.headerName || 'x-captcha-token';
    const cookieName = this.options.cookieName || 'captcha_token';
    
    // 优先从请求头获取 token，其次从 Cookie 获取
    let token = request.headers[headerName];
    let captchaId = request.headers['x-captcha-id'];
    
    // 如果请求头没有，尝试从 Cookie 获取
    if (!token && request.cookies && request.cookies[cookieName]) {
      token = request.cookies[cookieName];
      // 从 Cookie 获取时，需要从 token 中解析出 captchaId
      try {
        const decoded = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
        captchaId = decoded.id;
      } catch (error) {
        // 如果解析失败，继续使用请求头中的 captchaId
      }
    }
    
    if (!token) {
      throw new CaptchaTokenMissingException();
    }

    if (!captchaId) {
      throw new CaptchaTokenMissingException();
    }

    try {
      const isValid = await this.imageCaptchaService.verifyToken(captchaId, token, purpose);
      
      if (!isValid) {
        throw new CaptchaTokenInvalidException();
      }

      return true;
    } catch (error) {
      if (error instanceof CaptchaTokenMissingException || 
          error instanceof CaptchaTokenInvalidException || 
          error instanceof CaptchaTokenExpiredException) {
        throw error;
      }
      
      throw new CaptchaTokenInvalidException(error.message);
    }
  }
}