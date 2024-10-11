import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { AuthModule, JWTAuthGuard } from '@pictode-api/auth';
import { StorageModule, Storages } from '@pictode-api/storage';
import { FileModule } from './file/file.module';
import { PostModule } from './post/post.module';
import { PostService } from './post/post.service';
import { PrismaModule } from './prisma/prisma.module';
import { UserModule } from './user/user.module';
import { UserService } from './user/user.service';
import { RoleModule } from './role/role.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    StorageModule.forRoot(process.env.STORAGE_SERVICE as Storages),
    AuthModule.forRoot({ provide: 'UserService', useClass: UserService }),
    PrismaModule,
    UserModule,
    PostModule,
    FileModule,
    RoleModule,
  ],
  providers: [UserService, PostService, { provide: APP_GUARD, useClass: JWTAuthGuard }],
})
export class AppModule {}
