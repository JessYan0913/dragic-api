import { ApiProperty } from '@nestjs/swagger';

export class CreatePostVO {
  @ApiProperty({ description: '文章id' })
  id: number;

  @ApiProperty({ description: '文章标题' })
  title: string;

  @ApiProperty({ description: '文章内容', required: false })
  content?: string;
}
