import { SetMetadata } from '@nestjs/common';

export const CAPTCHA_PURPOSE_KEY = 'captcha_purpose';

export const CaptchaPurpose = (purpose: string) => SetMetadata(CAPTCHA_PURPOSE_KEY, purpose);