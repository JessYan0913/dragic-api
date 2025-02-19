import { ApiProperty } from '@nestjs/swagger';

export class ApplicationVO {
  @ApiProperty({ description: '应用ID' })
  id: number;

  @ApiProperty({ description: '应用名称' })
  name: string;

  @ApiProperty({ description: '应用描述', required: false })
  description?: string;

  @ApiProperty({ description: '创建者ID' })
  creatorId: number;

  @ApiProperty({ description: '创建时间' })
  createdAt: Date;

  @ApiProperty({ description: '更新时间' })
  updatedAt: Date;
}
