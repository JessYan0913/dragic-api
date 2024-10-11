import { Inject, Injectable } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { put } from '@vercel/blob';
import storageConfiguration from '../configs/storage.configuration';
import { Storage } from '../interfaces/storage.interface';

@Injectable()
export class VercelService implements Storage {
  constructor(
    @Inject(storageConfiguration.KEY)
    private readonly config: ConfigType<typeof storageConfiguration>,
  ) {}

  async upload(file: Express.Multer.File): Promise<string> {
    const result = await put(file.originalname, file.buffer, {
      access: 'public',
      token: this.config.vercelBlob.token,
      contentType: file.mimetype,
    });
    console.log('result', result);
    return result.url;
  }

  getUrl(fileKey: string): Promise<string> {
    throw new Error('Method not implemented.');
  }

  delete(fileKey: string): Promise<void> {
    throw new Error('Method not implemented.');
  }
}
