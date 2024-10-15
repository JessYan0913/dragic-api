import { Injectable } from '@nestjs/common';
import { put } from '@vercel/blob';
import { Storage } from '../interfaces/storage.interface';

@Injectable()
export class VercelService implements Storage {
  constructor(
    private readonly config: {
      token: string;
      baseUrl: string;
    },
  ) {}

  async upload(file: Express.Multer.File): Promise<string> {
    const result = await put(file.originalname, file.buffer, {
      access: 'public',
      token: this.config.token,
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
