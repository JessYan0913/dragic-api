import { DynamicModule, Module } from '@nestjs/common';
import { VercelService } from './service/vercel/vercel.service';
import { StorageController } from './storage.controller';

@Module({})
export class StorageModule {
  static register(service: 'S3' | 'Vercel'): DynamicModule {
    const providers = {
      provide: 'IStorageService',
      useClass: service === 'S3' ? VercelService : VercelService,
    };
    return {
      module: StorageModule,
      controllers: [StorageController],
      providers: [providers],
      exports: [providers],
    };
  }
}
