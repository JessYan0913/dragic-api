import { ApiProperty } from '@nestjs/swagger';

export class DeleteRoleVO {
  @ApiProperty({ description: '被删除角色的ID' })
  id: number;

  @ApiProperty({ description: '被删除角色的名称' })
  name: string;

  // 如果需要，可以添加其他属性
}
