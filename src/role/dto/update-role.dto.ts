import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsInt, IsOptional, IsString } from 'class-validator';

export class UpdateRoleDto {
  @ApiProperty({ description: '角色名称', required: false }) // 可选属性
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ description: '权限ID数组', type: [Number] }) // 权限数组
  @IsArray()
  @IsInt({ each: true }) // 确保数组中的每个元素都是整数
  permissions: number[];
}
