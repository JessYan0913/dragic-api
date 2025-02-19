import { ApiProperty } from '@nestjs/swagger';

export class CreatePageDto {
  @ApiProperty({ description: '页面标题' })
  title: string;

  @ApiProperty({ description: '页面路径' })
  path: string;

  @ApiProperty({ description: '页面组件配置', type: 'object' })
  components: Record<string, any>;
}
