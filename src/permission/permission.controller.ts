import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { Permission } from '@prisma/client';
import { PermissionService } from './permission.service';

@Controller('permission')
export class PermissionController {
  constructor(private readonly permissionService: PermissionService) {}

  @Get('/all')
  async getAllPermissions(): Promise<Permission[]> {
    return this.permissionService.permissions({});
  }

  @Post()
  async createPermission(@Body() data: Permission): Promise<Permission> {
    return this.permissionService.createPermission(data);
  }

  @Delete('/:id')
  async deletePermission(@Param('id') id: string): Promise<Permission> {
    return this.permissionService.deletePermission(id);
  }
}
