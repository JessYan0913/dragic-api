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
      defaultPurpose?: string;
    } = {}
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const purpose = this.reflector.get<string>(CAPTCHA_PURPOSE_KEY, context.getHandler()) || 
                   this.reflector.get<string>(CAPTCHA_PURPOSE_KEY, context.getClass()) ||
                   this.options.defaultPurpose || 'default';

    const request = context.switchToHttp().getRequest();
    const headerName = this.options.headerName || 'x-captcha-token';
    
    const token = request.headers[headerName];
    if (!token) {
      throw new CaptchaTokenMissingException();
    }

    const captchaId = request.headers['x-captcha-id'];
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