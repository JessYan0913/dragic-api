import { ApiProperty } from '@nestjs/swagger';

export class UpdatePageDto {
  @ApiProperty({ description: '页面标题', required: false })
  title?: string;

  @ApiProperty({ description: '页面描述', required: false })
  description?: string;

  @ApiProperty({ description: '页面配置', type: 'object', required: false })
  config?: Record<string, any>;
}
