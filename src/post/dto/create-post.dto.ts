import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class CreatePostDto {
  @ApiProperty({ description: '文章标题' })
  @IsString()
  title: string;

  @ApiProperty({ description: '文章内容', required: false })
  @IsString()
  @IsOptional()
  content?: string;
}
