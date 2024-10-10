import { DynamicModule, Module } from '@nestjs/common';
import { VercelService } from './service/vercel/vercel.service';
import { StorageController } from './storage.controller';

@Module({
  controllers: [StorageController],
  providers: [VercelService],
})
export class StorageModule {
  static register(): DynamicModule {
    const providers = {
      provide: 'StorageService',
      useClass: process.env.STORAGE_SERVICE === 'vercel_blob' ? VercelService : VercelService,
    };
    return {
      module: StorageModule,
      controllers: [StorageController],
      providers: [providers],
      exports: [providers],
    };
  }
}
