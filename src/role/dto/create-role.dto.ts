import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class CreateRoleDto {
  @ApiProperty({ description: '角色名称' }) // 添加描述
  @IsString() // 确保角色名称是字符串
  name: string;
}
