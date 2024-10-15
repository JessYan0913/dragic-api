import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class PermissionVO {
  @ApiProperty({ description: '权限ID' })
  id: number;

  @ApiProperty({ description: '权限名称' })
  name: string;

  @ApiProperty({ description: '权限描述' })
  description: string;

  @ApiProperty({ description: '资源' })
  resource: string;

  @ApiProperty({ description: '动作' })
  action: string;
}

export class SetPermissionsVO {
  @ApiProperty({ description: '用户ID' })
  id: string;

  @ApiProperty({ type: [PermissionVO], description: '成功设置的权限列表' })
  @Type(() => PermissionVO)
  permissions: PermissionVO[];
}
