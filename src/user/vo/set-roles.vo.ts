import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class RoleVo {
  @ApiProperty({ description: '角色 ID' })
  id: number;

  @ApiProperty({ description: '角色名称' })
  name: string;
}

export class SetRolesVO {
  @ApiProperty({ description: '用户 ID' })
  id: number;

  @ApiProperty({ type: [RoleVo], description: '用户角色 ID 列表' })
  @Type(() => RoleVo) // 使用 class-transformer 进行类型映射
  roles: RoleVo[];
}
