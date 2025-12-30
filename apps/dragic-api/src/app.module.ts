import { AuthModule } from '@dragic/auth';
import { CacheModule } from '@dragic/cache';
import { DrizzleModule } from '@dragic/database';
import { StorageModule } from '@dragic/storage';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { LoggerModule } from 'nestjs-pino';
import { join } from 'path';
import { UserModule } from './user/user.module';
import { UserService } from './user/user.service';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    LoggerModule.forRootAsync({
      useFactory: () => {
        const isProduction = process.env.NODE_ENV === 'production'; // 直接使用 process.env
        return {
          pinoHttp: {
            transport: isProduction
              ? {
                  target: 'pino-roll',
                  options: {
                    file: join('logs', 'log'),
                    frequency: 'daily',
                    mkdir: true,
                    dateFormat: 'yyyy-MM-dd-hh',
                  },
                }
              : {
                  target: 'pino-pretty',
                  options: { singleLine: true },
                },
            level: isProduction ? 'info' : 'debug',
            timestamp: () => {
              const now = new Date();
              const formattedDate = new Intl.DateTimeFormat('zh-CN', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                hour12: false, // 24小时制
              })
                .format(now)
                .replace(/\//g, '-')
                .replace(',', ' '); // 替换格式为 yyyy-MM-dd HH:mm:ss
              return `,"time":"${formattedDate}"`; // 格式化为 yyyy-MM-dd hh:mm:ss
            },
          },
        };
      },
    }),
    StorageModule.forRoot(
      process.env.STORAGE_SERVICE === 'minio'
        ? {
            service: 'minio',
            config: {
              endPoint: process.env.MINIO_ENDPOINT ?? '',
              port: process.env.MINIO_PORT ? Number(process.env.MINIO_PORT) : undefined,
              useSSL: process.env.MINIO_USE_SSL === 'true',
              accessKey: process.env.MINIO_ACCESS_KEY ?? '',
              secretKey: process.env.MINIO_SECRET_KEY ?? '',
              bucket: process.env.MINIO_BUCKET ?? '',
              publicBaseUrl: process.env.MINIO_PUBLIC_BASE_URL,
            },
          }
        : {
            service: 'vercel_blob',
            config: {
              token: process.env.VERCEL_BLOB_TOKEN ?? '',
              baseUrl: process.env.VERCEL_BLOB_BASE_URL ?? '',
            },
          },
    ),
    AuthModule.forRoot({
      userService: UserService,
      enableJwtGuard: process.env.ENABLE_JWT_GUARD === 'true', // 将字符串转换为布尔值
      enableResourceGuard: process.env.ENABLE_RESOURCE_GUARD === 'true', // 将字符串转换为布尔值
      jwt: {
        secret: process.env.JWT_SECRET,
        signOptions: { expiresIn: process.env.JWT_EXPIRES_IN },
      },
    }),
    CacheModule.forRoot(
      process.env.CACHE_SERVICE === 'vercel_kv'
        ? {
            service: 'vercel_kv',
            config: {
              token: process.env.KV_REST_API_TOKEN ?? '',
              url: process.env.KV_URL ?? '',
            },
          }
        : {
            service: 'redis',
            config: {
              url: process.env.REDIS_URL ?? process.env.KV_URL ?? '',
            },
          },
    ),
    DrizzleModule,
    UserModule,
  ],
})
export class AppModule {}
