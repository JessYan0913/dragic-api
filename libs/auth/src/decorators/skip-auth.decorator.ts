import { SetMetadata } from '@nestjs/common';

export const IS_AUTH_PUBLIC_KEY = 'isPublic';
export const SkipAuth = () => SetMetadata(IS_AUTH_PUBLIC_KEY, true);
