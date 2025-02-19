import { ApiProperty } from '@nestjs/swagger';
import { ApplicationVO } from './application.vo';

export class CreatorVO {
  @ApiProperty({ description: '创建者ID' })
  id: number;

  @ApiProperty({ description: '创建者名称' })
  name: string;

  @ApiProperty({ description: '创建者邮箱' })
  email: string;
}

export class PageVO {
  @ApiProperty({ description: '页面ID' })
  id: number;

  @ApiProperty({ description: '页面标题' })
  title: string;

  @ApiProperty({ description: '页面路径' })
  path: string;

  @ApiProperty({ description: '页面组件树' })
  components: any;
}

export class ApplicationDetailVO extends ApplicationVO {
  @ApiProperty({ description: '创建者信息', type: CreatorVO })
  creator: CreatorVO;

  @ApiProperty({ description: '应用包含的页面列表', type: [PageVO] })
  pages: PageVO[];
}
