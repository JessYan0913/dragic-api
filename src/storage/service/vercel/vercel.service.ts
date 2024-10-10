import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { put } from '@vercel/blob';
import { StorageService } from '../../storage.interface';

@Injectable()
export class VercelService implements StorageService {
  constructor(private configService: ConfigService) {}

  async upload(file: Express.Multer.File): Promise<string> {
    const result = await put(file.originalname, file.buffer, {
      access: 'public',
      token: this.configService.get<string>('VERCEL_BLOB_TOKEN'),
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
