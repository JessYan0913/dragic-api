import { ApiProperty } from '@nestjs/swagger';
import { ApplicationVO } from './application.vo';
import { CreatorVO } from './application-detail.vo';

export class CreateApplicationVO extends ApplicationVO {
  @ApiProperty({ description: '创建者信息', type: CreatorVO })
  creator: CreatorVO;
}
