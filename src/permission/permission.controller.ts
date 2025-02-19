import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';
import { PermissionService } from './permission.service';
import { CreatePermissionVO } from './vo/create-permission.vo';
import { DeletePermissionVO } from './vo/delete-permission.vo';
import { PermissionListVO } from './vo/permission-list.vo';
import { UpdatePermissionVO } from './vo/update-permission.vo';

@ApiTags('权限管理')
@Controller('permission')
export class PermissionController {
  constructor(private readonly permissionService: PermissionService) {}

  @Get('/all')
  @ApiOperation({ summary: '获取所有权限', description: '获取系统中所有权限的列表' })
  @ApiResponse({
    status: 200,
    description: '获取所有权限的列表',
    type: PermissionListVO,
  })
  async getAllPermissions(): Promise<PermissionListVO> {
    return this.permissionService.permissions({});
  }

  @Post()
  @ApiOperation({ summary: '创建权限', description: '创建新的系统权限' })
  @ApiResponse({
    status: 201,
    description: '创建权限成功',
    type: CreatePermissionVO,
  })
  async createPermission(@Body() data: CreatePermissionDto): Promise<CreatePermissionVO> {
    return this.permissionService.createPermission(data);
  }

  @Put('/:id')
  @ApiOperation({ summary: '更新权限', description: '更新指定权限的信息' })
  @ApiResponse({
    status: 200,
    description: '权限更新成功',
    type: UpdatePermissionVO,
  })
  async updatePermission(@Param('id') id: number, @Body() data: UpdatePermissionDto): Promise<UpdatePermissionVO> {
    return this.permissionService.updatePermission({ where: { id }, data });
  }

  @Delete('/:id')
  @ApiOperation({ summary: '删除权限', description: '删除指定的系统权限' })
  @ApiResponse({
    status: 200,
    description: '权限删除成功',
    type: DeletePermissionVO,
  })
  async deletePermission(@Param('id') id: number): Promise<DeletePermissionVO> {
    return this.permissionService.deletePermission(id);
  }
}
