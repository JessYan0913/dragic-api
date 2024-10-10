import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { StorageModule } from './storage/storage.module';

@Module({
  imports: [StorageModule.register('Vercel')],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
