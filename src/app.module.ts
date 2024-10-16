import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from '@pictode-api/auth';
import { CacheModule } from '@pictode-api/cache';
import { PrismaModule } from '@pictode-api/prisma';
import { StorageModule } from '@pictode-api/storage';
import { LoggerModule } from 'nestjs-pino';
import { join } from 'path';
import { AccountModule } from './account/account.module';
import { FileModule } from './file/file.module';
import { PermissionModule } from './permission/permission.module';
import { PostModule } from './post/post.module';
import { RoleModule } from './role/role.module';
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
    StorageModule.forRoot({
      service: process.env.STORAGE_SERVICE as any,
      config: { token: process.env.VERCEL_BLOB_TOKEN, baseUrl: process.env.VERCEL_BLOB_BASE_URL },
    }),
    AuthModule.forRoot({
      userService: UserService,
      enableJwtGuard: process.env.ENABLE_JWT_GUARD === 'true', // 将字符串转换为布尔值
      enableResourceGuard: process.env.ENABLE_RESOURCE_GUARD === 'true', // 将字符串转换为布尔值
      jwt: {
        secret: process.env.JWT_SECRET,
        signOptions: { expiresIn: process.env.JWT_EXPIRES_IN },
      },
    }),
    CacheModule.forRoot({
      service: 'vercel_kv',
      config: { token: process.env.KV_REST_API_TOKEN, url: process.env.KV_REST_API_URL },
    }),
    PrismaModule,
    UserModule,
    PostModule,
    FileModule,
    RoleModule,
    PermissionModule,
    AccountModule,
  ],
})
export class AppModule {}
