import { ApiProperty } from '@nestjs/swagger'; // 导入ApiProperty
import { IsArray, IsInt } from 'class-validator';

export class SetPermissionsDto {
  @ApiProperty({ type: [Number], description: '权限数组，确保每个元素都是数字' }) // 添加Swagger注释
  @IsArray()
  @IsInt({ each: true }) // 确保数组中的每个元素都是数字
  permissions: number[];
}
