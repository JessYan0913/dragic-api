import { AppController } from '@/app.controller';
import { AppService } from '@/app.service';
import storageConfiguration from '@/config/storage.configuration';
import { StorageModule } from '@/storage/storage.module';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PostService } from './post/post.service';
import { PrismaModule } from './prisma/prisma.module';
import { UserService } from './user/user.service';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, load: [storageConfiguration] }),
    StorageModule.register(),
    PrismaModule,
  ],
  controllers: [AppController],
  providers: [AppService, UserService, PostService],
})
export class AppModule {}
