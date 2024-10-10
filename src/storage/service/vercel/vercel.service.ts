import { Injectable } from '@nestjs/common';
import { put } from '@vercel/blob';
import { StorageService } from '../../storage.interface';

@Injectable()
export class VercelService implements StorageService {
  async upload(file: Express.Multer.File): Promise<string> {
    const result = await put(file.originalname, file.buffer, {
      access: 'public',
      token: 'vercel_blob_rw_Wfzr4ksV4RXYwMTa_aKePGGsR164E7TOMqBy4UMW4rUVRAV',
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
