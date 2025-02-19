import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { RoleService } from './role.service';
import { CreateRoleVO } from './vo/create-role.vo';
import { DeleteRoleVO } from './vo/delete-role.vo';
import { RoleListVO } from './vo/role-list.vo';
import { UpdateRoleVO } from './vo/update-role.vo';

@ApiTags('角色管理')
@Controller('role')
export class RoleController {
  constructor(private readonly roleService: RoleService) {}

  @Get('/all')
  @ApiOperation({ summary: '获取所有角色', description: '获取系统中所有角色的列表' })
  @ApiResponse({
    status: 200,
    description: '获取所有角色的列表',
    type: RoleListVO,
  })
  async getAll(): Promise<RoleListVO> {
    return await this.roleService.roles({});
  }

  @Post()
  @ApiOperation({ summary: '创建角色', description: '创建新的系统角色' })
  @ApiResponse({
    status: 201,
    description: '角色创建成功',
    type: CreateRoleVO,
  })
  async create(@Body() data: CreateRoleDto): Promise<CreateRoleVO> {
    return await this.roleService.createRole(data);
  }

  @Put('/:id')
  @ApiOperation({ summary: '更新角色', description: '更新指定角色的信息和权限' })
  @ApiResponse({
    status: 200,
    description: '角色更新成功',
    type: UpdateRoleVO,
  })
  async updateRole(@Param('id') id: number, @Body() data: UpdateRoleDto): Promise<UpdateRoleVO> {
    return await this.roleService.updateRole({
      where: { id },
      data: {
        name: data.name,
        permissions: {
          set: data.permissions.map((permission) => ({ id: permission })),
        },
      },
    });
  }

  @Delete('/:id')
  @ApiOperation({ summary: '删除角色', description: '删除指定的系统角色' })
  @ApiResponse({
    status: 200,
    description: '角色删除成功',
    type: DeleteRoleVO,
  })
  async deleteRole(@Param('id') id: number): Promise<DeleteRoleVO> {
    return await this.roleService.deleteRole({ id });
  }
}
