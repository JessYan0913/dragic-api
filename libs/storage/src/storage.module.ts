import { DynamicModule, Global, Module } from '@nestjs/common';
import { VercelService } from './vercel/vercel.service';

const storages = {
  vercel_blob: VercelService,
};

export type Storages = keyof typeof storages;

@Global()
@Module({
  providers: [VercelService],
  exports: [VercelService],
})
export class StorageModule {
  static forRoot(storage: Storages): DynamicModule {
    const providers = {
      provide: 'Storage',
      useClass: storages[storage],
    };
    return {
      global: true,
      module: StorageModule,
      providers: [providers],
      exports: [providers],
    };
  }
}
