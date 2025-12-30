import { AuthModule } from '@dragic/auth';
import { CacheModule } from '@dragic/cache';
import { DrizzleModule } from '@dragic/database';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { LoggerModule } from 'nestjs-pino';
import { join } from 'path';
import { OidcModule } from './oidc/oidc.module';
import { UserModule } from './user/user.module';
import { UserService } from './user/user.service';
import { AuthModule as LocalAuthModule } from './auth/auth.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    LoggerModule.forRootAsync({
      useFactory: () => {
        const isProduction = process.env.NODE_ENV === 'production';
        return {
          pinoHttp: {
            transport: isProduction
              ? {
                  target: 'pino-roll',
                  options: {
                    file: join('logs', 'auth-server'),
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
          },
        };
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
    AuthModule.forRoot({
      userService: UserService,
      enableJwtGuard: false,
      enableResourceGuard: false,
      jwt: {
        secret: process.env.JWT_SECRET,
        signOptions: { expiresIn: process.env.JWT_EXPIRES_IN || '1h' },
      },
      oauth: {
        feishu: {
          clientId: process.env.FEISHU_APP_ID ?? '',
          clientSecret: process.env.FEISHU_APP_SECRET ?? '',
          appId: process.env.FEISHU_APP_ID ?? '',
          appSecret: process.env.FEISHU_APP_SECRET ?? '',
          redirectUri: process.env.FEISHU_REDIRECT_URI ?? '',
        },
      },
    }),
    DrizzleModule,
    UserModule,
    OidcModule,
    LocalAuthModule,
  ],
})
export class AppModule {}
