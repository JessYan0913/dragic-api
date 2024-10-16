import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class RoleVO {
  @ApiProperty({ description: '角色 ID' })
  id: number;

  @ApiProperty({ description: '角色名称' })
  name: string;
}

export class SetRolesVO {
  @ApiProperty({ description: '用户 ID' })
  id: number;

  @ApiProperty({ type: [RoleVO], description: '用户角色 ID 列表' })
  @Type(() => RoleVO) // 使用 class-transformer 进行类型映射
  roles: RoleVO[];
}
