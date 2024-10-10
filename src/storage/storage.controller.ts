import { Controller, Get, Inject, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { StorageService } from './storage.interface';

@Controller('storage')
export class StorageController {
  constructor(@Inject('IStorageService') private readonly storageService: StorageService) {}

  @Get()
  index() {
    return 'Storage API';
  }

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    const url = await this.storageService.upload(file);
    return { url };
  }
}
