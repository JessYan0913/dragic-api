import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { RoleService } from './role.service';

@Controller('role')
export class RoleController {
  constructor(private readonly roleService: RoleService) {}

  @Get('/all')
  async getAll() {
    return await this.roleService.roles({});
  }

  @Post()
  async create(@Body() data: { name: string }) {
    return await this.roleService.createRole(data);
  }

  @Put('/:id')
  async update(@Param('id') id: string, @Body() data: { name: string }) {
    return await this.roleService.updateRole(
      {
        where: { id: Number(id) },
      },
      data,
    );
  }

  @Delete('/:id')
  async delete(@Param('id') id: string) {
    return await this.roleService.deleteRole({ id: Number(id) });
  }
}
