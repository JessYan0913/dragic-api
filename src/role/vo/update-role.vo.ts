import { ApiProperty } from '@nestjs/swagger';

export class UpdateRoleVO {
  @ApiProperty({ description: '角色ID' })
  id: number;

  @ApiProperty({ description: '角色名称' })
  name: string;

  @ApiProperty({ description: '权限ID数组' })
  permissions: number[]; // 如果Role类型中还有其他属性，可以在这里添加
}
