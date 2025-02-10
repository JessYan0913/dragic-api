import { DynamicModule, Global, Module } from '@nestjs/common';
import { VercelService } from './vercel/vercel.service';

const storages = {
  vercel_blob: VercelService,
};

export type ForRootOptions = {
  service: 'vercel_blob';
  config: {
    token: string;
    baseUrl: string;
  };
};

@Global()
@Module({})
export class StorageModule {
  static forRoot({ service, config }: ForRootOptions): DynamicModule {
    const providers = {
      provide: 'Storage',
      useFactory: () => service && new storages[service](config),
    };
    return {
      global: true,
      module: StorageModule,
      providers: [providers],
      exports: [providers],
    };
  }
}
