import { Module, DynamicModule } from '@nestjs/common';
import { CaptchaService } from './captcha.service';
import { CaptchaConfig, Storage, ImageLoader } from './types';

export interface CaptchaModuleOptions {
  storage: Storage;
  imageLoader: ImageLoader;
  defaultSize?: { width: number; height: number };
  trailMinLength?: number;
  durationMin?: number;
  durationMax?: number;
  sliderOffsetMin?: number;
  trailTolerance?: number;
  ttl?: number;
  secret?: string;
}

@Module({})
export class CaptchaModule {
  static register(options: CaptchaModuleOptions): DynamicModule {
    const captchaConfig: CaptchaConfig = {
      storage: options.storage,
      imageLoader: options.imageLoader,
      defaultSize: options.defaultSize || { width: 300, height: 200 },
      trailMinLength: options.trailMinLength || 10,
      durationMin: options.durationMin || 100,
      durationMax: options.durationMax || 10000,
      sliderOffsetMin: options.sliderOffsetMin || 5,
      trailTolerance: options.trailTolerance || 10,
      ttl: options.ttl || 300,
      secret: options.secret || 'default-secret-change-in-production',
    };

    return {
      module: CaptchaModule,
      providers: [
        {
          provide: CaptchaService,
          useFactory: () => new CaptchaService(captchaConfig),
        },
      ],
      exports: [CaptchaService],
      global: true,
    };
  }

  static forRootAsync(options: {
    useFactory: (...args: any[]) => Promise<CaptchaModuleOptions> | CaptchaModuleOptions;
    inject?: any[];
  }): DynamicModule {
    return {
      module: CaptchaModule,
      providers: [
        {
          provide: CaptchaService,
          useFactory: async (...args: any[]) => {
            const captchaOptions = await options.useFactory(...args);
            return new CaptchaService({
              storage: captchaOptions.storage,
              imageLoader: captchaOptions.imageLoader,
              defaultSize: captchaOptions.defaultSize || { width: 300, height: 200 },
              trailMinLength: captchaOptions.trailMinLength || 10,
              durationMin: captchaOptions.durationMin || 100,
              durationMax: captchaOptions.durationMax || 10000,
              sliderOffsetMin: captchaOptions.sliderOffsetMin || 5,
              trailTolerance: captchaOptions.trailTolerance || 10,
              ttl: captchaOptions.ttl || 300,
              secret: captchaOptions.secret || 'default-secret-change-in-production',
            });
          },
          inject: options.inject || [],
        },
      ],
      exports: [CaptchaService],
      global: true,
    };
  }
}
