import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { Role } from '@prisma/client';
import { RoleService } from './role.service';

@Controller('role')
export class RoleController {
  constructor(private readonly roleService: RoleService) {}

  @Get('/all')
  async getAll(): Promise<Role[]> {
    return await this.roleService.roles({});
  }

  @Post()
  async create(@Body() data: { name: string }): Promise<Role> {
    return await this.roleService.createRole(data);
  }

  @Put('/:id')
  async update(@Param('id') id: string, @Body() data: { name: string; permissions: string[] }): Promise<Role> {
    return await this.roleService.updateRole({
      where: { id: Number(id) },
      data: {
        name: data.name,
        permissions: {
          set: data.permissions.map((permission) => ({ id: Number(permission) })),
        },
      },
    });
  }

  @Delete('/:id')
  async delete(@Param('id') id: string): Promise<Role> {
    return await this.roleService.deleteRole({ id: Number(id) });
  }
}
