import { ApiProperty } from '@nestjs/swagger';
import { Action } from '@prisma/client';
import { IsEnum, IsString } from 'class-validator';

export class CreatePermissionDto {
  @ApiProperty({ description: '权限名称' })
  @IsString()
  name: string;

  @ApiProperty({ description: '权限描述' })
  @IsString()
  description: string;

  @ApiProperty({ description: '权限资源' })
  @IsString()
  resource: string;

  @ApiProperty({ description: '权限动作' })
  @IsEnum(Action) // 支持所有 REST API 动作
  action: Action;
}
