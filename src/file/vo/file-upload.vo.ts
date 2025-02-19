import { ApiProperty } from '@nestjs/swagger';

export class FileUploadVO {
  @ApiProperty({ description: '文件URL' })
  url: string;

  @ApiProperty({ description: '文件名' })
  filename: string;

  @ApiProperty({ description: '文件大小（字节）' })
  size: number;

  @ApiProperty({ description: '文件MIME类型' })
  mimetype: string;

  @ApiProperty({ description: '上传时间' })
  uploadedAt: Date;
}
