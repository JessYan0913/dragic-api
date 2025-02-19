import { ApiProperty } from '@nestjs/swagger';

export class RoleItemVO {
  @ApiProperty({ description: '角色ID' })
  id: number;

  @ApiProperty({ description: '角色名称' })
  name: string;

  @ApiProperty({ description: '权限数量' })
  permissionCount: number;

  @ApiProperty({ description: '创建时间' })
  createdAt: Date;

  @ApiProperty({ description: '更新时间' })
  updatedAt: Date;
}

export class RoleListVO {
  @ApiProperty({ description: '角色列表', type: [RoleItemVO] })
  items: RoleItemVO[];

  @ApiProperty({ description: '总数' })
  total: number;
}
