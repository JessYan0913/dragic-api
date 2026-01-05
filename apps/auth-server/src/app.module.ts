import { AuthModule } from '@dragic/auth';
import { Cache, CacheModule } from '@dragic/cache';
import { DrizzleModule } from '@dragic/database';
import { EmailCaptchaModule } from '@dragic/email-captcha';
import { ImageCaptchaModule, LocalImageLoader } from '@dragic/image-captcha';
import { MailModule } from '@dragic/mail';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { LoggerModule } from 'nestjs-pino';
import { join } from 'path';
import { AuthModule as LocalAuthModule } from './auth/auth.module';
import { OidcModule } from './oidc/oidc.module';
import { UserModule } from './user/user.module';
import { UserService } from './user/user.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [join(process.cwd(), '..', '..', '.env.local'), join(__dirname, '.env.local')],
    }),
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
              url: process.env.REDIS_URL ?? '',
            },
          },
    ),
    MailModule.forRoot({
      host: process.env.MAIL_HOST || 'localhost',
      port: parseInt(process.env.MAIL_PORT || '587'),
      secure: process.env.MAIL_SECURE === 'true',
      auth: {
        user: process.env.MAIL_USER || '',
        pass: process.env.MAIL_PASS || '',
      },
      from: process.env.MAIL_FROM || 'noreply@example.com',
    }),
    ImageCaptchaModule.forRootAsync({
      useFactory: (cache: Cache) => ({
        storage: {
          set: async (key: string, value: string, ttl: number) => {
            await cache.set(key, value, ttl);
          },
          get: async (key: string): Promise<string | null> => {
            return await cache.get<string>(key);
          },
          del: async (key: string) => {
            await cache.del(key);
          },
        },
        imageLoader: new LocalImageLoader(join(process.cwd(), 'assets', 'captcha-images')),
        defaultSize: { width: 300, height: 200 },
        ttl: 300,
        secret: process.env.CAPTCHA_SECRET || 'default-secret',
      }),
      inject: ['Cache'],
    }),
    EmailCaptchaModule.forRootAsync({
      useFactory: (cache: Cache) => ({
        storage: {
          set: async (key: string, value: string, ttl: number) => {
            await cache.set(key, value, ttl);
          },
          get: async (key: string): Promise<string | null> => {
            return await cache.get<string>(key);
          },
          del: async (key: string) => {
            await cache.del(key);
          },
        },
        enableMail: false,
        ttl: 300,
        secret: process.env.EMAIL_CAPTCHA_SECRET || 'default-secret',
      }),
      inject: ['Cache'],
    }),
    AuthModule.forRoot({
      userService: UserService,
      enableJwtGuard: process.env.ENABLE_JWT_GUARD !== 'false',
      enableResourceGuard: process.env.ENABLE_RESOURCE_GUARD !== 'false',
      jwt: {
        secret: process.env.JWT_SECRET || 'fallback-secret',
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
