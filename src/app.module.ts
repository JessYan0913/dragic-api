import storageConfiguration from '@/config/storage.configuration';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { StorageModule, Storages } from '@pictode-api/storage';
import { PostModule } from './post/post.module';
import { PostService } from './post/post.service';
import { PrismaModule } from './prisma/prisma.module';
import { UserModule } from './user/user.module';
import { UserService } from './user/user.service';
import { FileModule } from './file/file.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, load: [storageConfiguration] }),
    StorageModule.forRoot(process.env.STORAGE_SERVICE as Storages),
    PrismaModule,
    UserModule,
    PostModule,
    FileModule,
  ],
  providers: [UserService, PostService],
})
export class AppModule {}
