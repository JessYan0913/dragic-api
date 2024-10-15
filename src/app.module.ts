import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from '@pictode-api/auth';
import { CacheModule } from '@pictode-api/cache';
import { PrismaModule } from '@pictode-api/prisma';
import { StorageModule } from '@pictode-api/storage';
import { AccountModule } from './account/account.module';
import { FileModule } from './file/file.module';
import { PermissionModule } from './permission/permission.module';
import { PostModule } from './post/post.module';
import { PostService } from './post/post.service';
import { RoleModule } from './role/role.module';
import { UserModule } from './user/user.module';
import { UserService } from './user/user.service';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    StorageModule.forRoot({
      service: process.env.STORAGE_SERVICE as any,
      config: {
        token: process.env.VERCEL_BLOB_TOKEN,
        baseUrl: process.env.VERCEL_BLOB_BASE_URL,
      },
    }),
    AuthModule.forRoot({
      userService: UserService,
      enableJwtGuard: process.env.ENABLE_JWT_GUARD === 'true', // 将字符串转换为布尔值
      enableResourceGuard: process.env.ENABLE_RESOURCE_GUARD === 'true', // 将字符串转换为布尔值
      jwt: {
        secret: process.env.JWT_SECRET,
        signOptions: {
          expiresIn: process.env.JWT_EXPIRES_IN,
        },
      },
    }),
    CacheModule.forRoot('vercel_kv'),
    PrismaModule,
    UserModule,
    PostModule,
    FileModule,
    RoleModule,
    PermissionModule,
    AccountModule,
  ],
  providers: [UserService, PostService],
})
export class AppModule {}
