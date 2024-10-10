import { AppController } from '@/app.controller';
import { AppService } from '@/app.service';
import storageConfiguration from '@/config/storage.configuration';
import { StorageModule } from '@/storage/storage.module';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true, load: [storageConfiguration] }), StorageModule.register()],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
