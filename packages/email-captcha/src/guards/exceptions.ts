import { HttpException, HttpStatus } from '@nestjs/common';

export class EmailCaptchaTokenMissingException extends HttpException {
  constructor() {
    super('Email captcha token is missing', HttpStatus.UNAUTHORIZED);
  }
}

export class EmailCaptchaTokenInvalidException extends HttpException {
  constructor(message: string = 'Invalid email captcha token') {
    super(message, HttpStatus.UNAUTHORIZED);
  }
}

export class EmailCaptchaTokenExpiredException extends HttpException {
  constructor() {
    super('Email captcha token has expired', HttpStatus.UNAUTHORIZED);
  }
}
