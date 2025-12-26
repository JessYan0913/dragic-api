import { DynamicModule, Global, Module } from '@nestjs/common';
import { MinioService } from './minio/minio.service';
import { VercelService } from './vercel/vercel.service';

type MinioConfig = {
  endPoint: string;
  port?: number;
  useSSL?: boolean;
  accessKey: string;
  secretKey: string;
  bucket: string;
  publicBaseUrl?: string;
};

type VercelBlobConfig = {
  token: string;
  baseUrl: string;
};

export type ForRootOptions =
  | {
      service: 'minio';
      config: MinioConfig;
    }
  | {
      service: 'vercel_blob';
      config: VercelBlobConfig;
    };

@Global()
@Module({})
export class StorageModule {
  static forRoot(options: ForRootOptions): DynamicModule {
    const providers = {
      provide: 'Storage',
      useFactory: () => {
        if (options.service === 'minio') {
          return new MinioService(options.config);
        }

        return new VercelService(options.config);
      },
    };
    return {
      global: true,
      module: StorageModule,
      providers: [providers],
      exports: [providers],
    };
  }
}
