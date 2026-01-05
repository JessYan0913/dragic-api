import { HttpException, HttpStatus } from '@nestjs/common';

export class CaptchaTokenMissingException extends HttpException {
  constructor() {
    super('Captcha token is missing', HttpStatus.UNAUTHORIZED);
  }
}

export class CaptchaTokenInvalidException extends HttpException {
  constructor(message: string = 'Invalid captcha token') {
    super(message, HttpStatus.UNAUTHORIZED);
  }
}

export class CaptchaTokenExpiredException extends HttpException {
  constructor() {
    super('Captcha token has expired', HttpStatus.UNAUTHORIZED);
  }
}