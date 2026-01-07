import { SetMetadata } from '@nestjs/common';

export const EMAIL_CAPTCHA_PURPOSE_KEY = 'email_captcha_purpose';

export const EmailCaptchaPurpose = (purpose: string) => SetMetadata(EMAIL_CAPTCHA_PURPOSE_KEY, purpose);
