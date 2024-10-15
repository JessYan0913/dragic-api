import { Body, Controller, Get, Param, Put } from '@nestjs/common';
import { User } from '@prisma/client';
import { UserService } from './user.service';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('all')
  async findAll(): Promise<User[]> {
    return this.userService.users({});
  }

  @Put('/:id')
  async updateUser(@Param('id') id: string, @Body() userData: { name?: string; email: string }): Promise<User> {
    return this.userService.updateUser({ where: { id: Number(id) }, data: userData });
  }

  @Put('/:id/roles')
  async setRoles(@Param('id') id: string, @Body() { roles }: { roles: string[] }): Promise<User> {
    return this.userService.setRoles({ userId: id, roleIds: roles });
  }

  @Put('/:id/permissions')
  async setPermissions(@Param('id') id: string, @Body() { permissions }: { permissions: string[] }): Promise<User> {
    return this.userService.updateUser({
      where: { id: Number(id) },
      data: {
        permissions: {
          set: permissions.map((permission) => ({ id: +permission })),
        },
      },
    });
  }
}
