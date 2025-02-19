import { ApiProperty } from '@nestjs/swagger';

export class PostDetailVO {
  @ApiProperty({ description: '帖子ID' })
  id: number;

  @ApiProperty({ description: '帖子标题' })
  title: string;

  @ApiProperty({ description: '帖子内容' })
  content: string;

  @ApiProperty({ description: '是否已发布' })
  published: boolean;

  @ApiProperty({ description: '作者ID' })
  authorId: number;

  @ApiProperty({ description: '创建时间' })
  createdAt: Date;

  @ApiProperty({ description: '更新时间' })
  updatedAt: Date;
}
