import { ApiProperty } from '@nestjs/swagger';
import { Action } from '@prisma/client';

export class DeletePermissionVO {
  @ApiProperty({ description: '权限ID' })
  id: number;

  @ApiProperty({ description: '权限名称' })
  name: string;

  @ApiProperty({ description: '权限描述' })
  description: string;

  @ApiProperty({ description: '权限路径' })
  resource: string;

  @ApiProperty({ description: '权限动作', enum: Action })
  action: Action;
}
