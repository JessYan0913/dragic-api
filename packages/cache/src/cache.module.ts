import { DynamicModule, Global, Module } from '@nestjs/common';
import { RedisService } from './redis/redis.service';
import { VercelService } from './vercel/vercel.service';
import { PostgresService } from './postgres/postgres.service';
import { DrizzleService } from '@dragic/database';

type RedisConfig = {
  url: string;
};

type VercelKVConfig = {
  token: string;
  url: string;
};

type PostgresConfig = {
  cleanupIntervalMs?: number; // 清理间隔，默认 5 分钟
};

export type ForRootOptions =
  | {
      service?: 'redis';
      config: RedisConfig;
    }
  | {
      service: 'vercel_kv';
      config: VercelKVConfig;
    }
  | {
      service: 'postgres';
      config: PostgresConfig;
    };

@Global()
@Module({})
export class CacheModule {
  static forRoot(options: ForRootOptions): DynamicModule {
    let providers;
    
    if (options?.service === 'vercel_kv') {
      providers = {
        provide: 'Cache',
        useFactory: () => new VercelService(options.config),
      };
    } else if (options?.service === 'postgres') {
      providers = {
        provide: 'Cache',
        useFactory: (drizzle: DrizzleService) => new PostgresService(drizzle, options.config),
        inject: [DrizzleService],
      };
    } else {
      // 默认使用 Redis
      console.log('[RedisService] Redis Client Config', options.config);
      providers = {
        provide: 'Cache',
        useFactory: () => new RedisService(options.config),
      };
    }

    return {
      global: true,
      module: CacheModule,
      providers: [providers],
      exports: [providers],
    };
  }
}
