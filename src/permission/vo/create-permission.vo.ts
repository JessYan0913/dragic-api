import { ApiProperty } from '@nestjs/swagger';
import { Action } from '@prisma/client';
import { IsEnum, IsString } from 'class-validator';

export class CreatePermissionVO {
  @ApiProperty({ description: '权限名称' })
  @IsString()
  name: string;

  @ApiProperty({ description: '权限描述' })
  @IsString()
  description: string;

  @ApiProperty({ description: '权限路径' })
  @IsString()
  resource: string;

  @ApiProperty({ description: '权限动作', enum: Action })
  @IsEnum(Action)
  action: Action;
}
