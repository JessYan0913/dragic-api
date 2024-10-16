import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { ApiResponse } from '@nestjs/swagger';
import { CreatePermissionDto } from './dto/create-permission.dto'; // 导入 CreatePermissionDto
import { UpdatePermissionDto } from './dto/update-permission.dto';
import { PermissionService } from './permission.service';
import { CreatePermissionVO } from './vo/create-permission.vo';
import { DeletePermissionVO } from './vo/delete-permission.vo';
import { PermissionListVO } from './vo/permission-list.vo';
import { UpdatePermissionVO } from './vo/update-permission.vo';

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
  @ApiResponse({
    status: 200,
    description: '权限更新成功',
    type: UpdatePermissionVO, // 指定返回类型
  })
  async updatePermission(@Param('id') id: number, @Body() data: UpdatePermissionDto): Promise<UpdatePermissionVO> {
    return this.permissionService.updatePermission({ where: { id }, data });
  }

  @Delete('/:id')
  @ApiResponse({
    status: 200,
    description: '角色删除成功',
    type: DeletePermissionVO,
  })
  async deletePermission(@Param('id') id: number): Promise<DeletePermissionVO> {
    return this.permissionService.deletePermission(id);
  }
}
