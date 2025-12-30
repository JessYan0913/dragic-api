import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsInt } from 'class-validator';

export class SetRolesDto {
  @ApiProperty({
    description: '角色ID数组，确保每个元素都是整数', // 添加更详细的描述
    type: [Number], // 指定类型为数字数组
  })
  @IsArray()
  @IsInt({ each: true }) // 确保数组中的每个元素都是整数
  roles: number[]; // 定义 roles 属性为数字数组
}
