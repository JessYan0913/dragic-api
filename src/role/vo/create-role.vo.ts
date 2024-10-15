import { ApiProperty } from '@nestjs/swagger';

export class CreateRoleVO {
  @ApiProperty({ description: '角色ID' })
  id: number;

  @ApiProperty({ description: '角色名称' })
  name: string;

  // 如果Role类型中还有其他属性，可以在这里添加
}
