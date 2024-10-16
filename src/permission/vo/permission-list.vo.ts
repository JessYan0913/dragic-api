import { ApiProperty } from '@nestjs/swagger';
import { Action } from '@prisma/client';
import { Type } from 'class-transformer';

export class PermissionVO {
  @ApiProperty({ description: '权限ID' })
  id: number;

  @ApiProperty({ description: '权限名称' })
  name: string;

  @ApiProperty({ description: '权限描述' })
  description: string;

  @ApiProperty({ description: '权限路径' })
  resource: string;

  @ApiProperty({ description: '权限动作', enum: Action })
  action: string;
}

export class PermissionListVO {
  @ApiProperty({ type: [PermissionVO], description: '权限列表' })
  @Type(() => PermissionVO)
  permissions: PermissionVO[];
}
