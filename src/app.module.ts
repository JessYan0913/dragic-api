import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from '@pictode-api/auth';
import { StorageModule, Storages } from '@pictode-api/storage';
import { FileModule } from './file/file.module';
import { PostModule } from './post/post.module';
import { PostService } from './post/post.service';
import { PrismaModule } from './prisma/prisma.module';
import { UserModule } from './user/user.module';
import { UserService } from './user/user.service';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    StorageModule.forRoot(process.env.STORAGE_SERVICE as Storages),
    AuthModule,
    PrismaModule,
    UserModule,
    PostModule,
    FileModule,
  ],
  providers: [UserService, PostService],
})
export class AppModule {}
