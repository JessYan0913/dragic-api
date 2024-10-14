import { SetMetadata } from '@nestjs/common';

export const IS_RESOURCE_KEY = 'isPublic';
export const SkipResource = () => SetMetadata(IS_RESOURCE_KEY, true);
