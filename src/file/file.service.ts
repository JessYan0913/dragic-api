import { Inject, Injectable } from '@nestjs/common';
import { Storage } from '@pictode-api/storage';

@Injectable()
export class FileService {
  constructor(@Inject('Storage') private readonly storage: Storage) {}

  async upload(file: Express.Multer.File) {
    return await this.storage.upload(file);
  }
}
