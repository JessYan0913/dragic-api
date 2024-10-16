import { DynamicModule, Global, Module } from '@nestjs/common';
import { VercelService } from './vercel/vercel.service';

const caches = {
  vercel_kv: VercelService,
};

export type ForRootOptions = {
  service: 'vercel_kv';
  config: {
    token: string;
    url: string;
  };
};

@Global()
@Module({})
export class CacheModule {
  static forRoot({ service, config }: ForRootOptions): DynamicModule {
    const providers = {
      provide: 'Cache',
      useFactory: () => new caches[service](config),
    };
    return {
      global: true,
      module: CacheModule,
      providers: [providers],
      exports: [providers],
    };
  }
}
