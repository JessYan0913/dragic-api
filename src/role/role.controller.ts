import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { ApiResponse } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { RoleService } from './role.service';
import { CreateRoleVO } from './vo/create-role.vo';
import { DeleteRoleVO } from './vo/delete-role.vo';
import { UpdateRoleVO } from './vo/update-role.vo';

@Controller('role')
export class RoleController {
  constructor(private readonly roleService: RoleService) {}

  @Get('/all')
  async getAll(): Promise<Role[]> {
    return await this.roleService.roles({});
  }

  @Post()
  @ApiResponse({
    status: 201,
    description: '角色创建成功',
    type: CreateRoleVO,
  })
  async create(@Body() data: CreateRoleDto): Promise<CreateRoleVO> {
    return await this.roleService.createRole(data);
  }

  @Put('/:id')
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
  @ApiResponse({
    status: 200,
    description: '角色删除成功',
    type: DeleteRoleVO,
  })
  async deleteRole(@Param('id') id: number): Promise<DeleteRoleVO> {
    return await this.roleService.deleteRole({ id });
  }
}
