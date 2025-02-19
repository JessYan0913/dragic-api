import { Controller, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiConsumes, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { FileService } from './file.service';
import { FileUploadVO } from './vo/file-upload.vo';

@ApiTags('文件管理')
@Controller('file')
export class FileController {
  constructor(private readonly fileService: FileService) {}

  @Post('upload')
  @ApiOperation({ summary: '上传文件', description: '上传单个文件到服务器' })
  @ApiConsumes('multipart/form-data')
  @ApiResponse({
    status: 201,
    description: '文件上传成功',
    type: FileUploadVO,
  })
  @UseInterceptors(FileInterceptor('file'))
  async upload(@UploadedFile() file: Express.Multer.File): Promise<FileUploadVO> {
    return await this.fileService.upload(file);
  }
}
