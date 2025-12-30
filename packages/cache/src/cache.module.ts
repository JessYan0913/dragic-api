import { DynamicModule, Global, Module } from '@nestjs/common';
import { RedisService } from './redis/redis.service';
import { VercelService } from './vercel/vercel.service';

type RedisConfig = {
  url: string;
};

type VercelKVConfig = {
  token: string;
  url: string;
};

export type ForRootOptions =
  | {
      service?: 'redis';
      config: RedisConfig;
    }
  | {
      service: 'vercel_kv';
      config: VercelKVConfig;
    };

@Global()
@Module({})
export class CacheModule {
  static forRoot(options: ForRootOptions): DynamicModule {
    const providers = {
      provide: 'Cache',
      useFactory: () => {
        if (options?.service === 'vercel_kv') {
          return new VercelService(options.config);
        }

        return new RedisService(options.config);
      },
    };
    return {
      global: true,
      module: CacheModule,
      providers: [providers],
      exports: [providers],
    };
  }
}
