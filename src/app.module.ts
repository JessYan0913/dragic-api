import storageConfiguration from '@/config/storage.configuration';
import { StorageModule, StorageServices } from '@/storage/storage.module';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PostModule } from './post/post.module';
import { PostService } from './post/post.service';
import { PrismaModule } from './prisma/prisma.module';
import { UserModule } from './user/user.module';
import { UserService } from './user/user.service';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, load: [storageConfiguration] }),
    StorageModule.forRoot(process.env.STORAGE_SERVICE as StorageServices),
    PrismaModule,
    UserModule,
    PostModule,
  ],
  providers: [UserService, PostService],
})
export class AppModule {}
