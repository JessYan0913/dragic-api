import { DynamicModule, Global, Module } from '@nestjs/common';
import { VercelService } from './vercel/vercel.service';

const caches = {
  vercel_kv: VercelService,
};

export type Caches = keyof typeof caches;

@Global()
@Module({
  providers: [VercelService],
  exports: [VercelService],
})
export class CacheModule {
  static forRoot(storage: Caches): DynamicModule {
    const providers = {
      provide: 'Cache',
      useClass: caches[storage],
    };
    return {
      global: true,
      module: CacheModule,
      providers: [providers],
      exports: [providers],
    };
  }
}
