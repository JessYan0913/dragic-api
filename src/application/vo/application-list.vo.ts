import { ApiProperty } from '@nestjs/swagger';
import { ApplicationVO } from './application.vo';

export class ApplicationListVO extends ApplicationVO {
  @ApiProperty({ description: '创建者名称' })
  creatorName: string;

  @ApiProperty({ description: '页面数量' })
  pageCount: number;
}
