import { ApiProperty } from '@nestjs/swagger';

export class PageDetailVO {
  @ApiProperty({ description: '页面ID' })
  id: number;

  @ApiProperty({ description: '页面标题' })
  title: string;

  @ApiProperty({ description: '页面路径' })
  path: string;

  @ApiProperty({ description: '页面组件配置', type: 'object' })
  components: Record<string, any>;

  @ApiProperty({ description: '所属应用ID' })
  applicationId: number;

  @ApiProperty({ description: '创建时间' })
  createdAt: Date;

  @ApiProperty({ description: '更新时间' })
  updatedAt: Date;
}
