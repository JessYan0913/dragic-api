import { DynamicModule, Module } from '@nestjs/common';
import { VercelService } from './service/vercel/vercel.service';
import { StorageController } from './storage.controller';

const services = {
  vercel_blob: VercelService,
};

export type StorageServices = keyof typeof services;

@Module({
  controllers: [StorageController],
  providers: [VercelService],
  exports: [VercelService],
})
export class StorageModule {
  static forRoot(service: StorageServices): DynamicModule {
    const providers = {
      provide: 'StorageService',
      useClass: services[service],
    };
    return {
      module: StorageModule,
      controllers: [StorageController],
      providers: [providers],
      exports: [providers],
    };
  }
}
