import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { AuthModule, JWTAuthGuard, ResourceAuthGuard } from '@pictode-api/auth';
import { CacheModule } from '@pictode-api/cache';
import { PrismaModule } from '@pictode-api/prisma';
import { StorageModule, Storages } from '@pictode-api/storage';
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
    StorageModule.forRoot(process.env.STORAGE_SERVICE as Storages),
    AuthModule.forRoot({ provide: 'UserService', useClass: UserService }),
    CacheModule.forRoot('vercel_kv'),
    PrismaModule,
    UserModule,
    PostModule,
    FileModule,
    RoleModule,
    PermissionModule,
  ],
  providers: [
    UserService,
    PostService,
    { provide: APP_GUARD, useClass: JWTAuthGuard },
    { provide: APP_GUARD, useClass: ResourceAuthGuard },
  ],
})
export class AppModule {}
