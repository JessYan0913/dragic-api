import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { ApiResponse } from '@nestjs/swagger';
import { Permission } from '@prisma/client';
import { CreatePermissionDto } from './dto/create-permission.dto'; // 导入 CreatePermissionDto
import { PermissionService } from './permission.service';
import { CreatePermissionVO } from './vo/create-permission.vo';
import { PermissionListVO } from './vo/permission-list.vo';

@Controller('permission')
export class PermissionController {
  constructor(private readonly permissionService: PermissionService) {}

  @Get('/all')
  @ApiResponse({
    status: 200,
    description: '获取所有权限的列表',
    type: PermissionListVO,
  })
  async getAllPermissions(): Promise<PermissionListVO> {
    return this.permissionService.permissions({});
  }

  @Post()
  @ApiResponse({
    status: 201,
    description: '创建权限成功',
    type: CreatePermissionVO, // 指定返回类型
  })
  async createPermission(@Body() data: CreatePermissionDto): Promise<CreatePermissionVO> {
    return this.permissionService.createPermission(data);
  }

  @Put('/:id')
  async updatePermission(@Param('id') id: string, @Body() data: Omit<Permission, 'id'>): Promise<Permission> {
    return this.permissionService.updatePermission({ where: { id: +id }, data });
  }

  @Delete('/:id')
  async deletePermission(@Param('id') id: string): Promise<Permission> {
    return this.permissionService.deletePermission(id);
  }
}
