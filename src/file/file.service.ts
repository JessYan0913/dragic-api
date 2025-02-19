import { Inject, Injectable } from '@nestjs/common';
import { Storage } from '@pictode-api/storage';
import { FileUploadVO } from './vo/file-upload.vo';

@Injectable()
export class FileService {
  constructor(@Inject('Storage') private readonly storage: Storage) {}

  async upload(file: Express.Multer.File): Promise<FileUploadVO> {
    const url = await this.storage.upload(file);
    return {
      url,
      filename: file.originalname,
      size: file.size,
      mimetype: file.mimetype,
      uploadedAt: new Date(),
    };
  }
}
