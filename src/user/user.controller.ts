import { Body, Controller, Get, Param, Post, Put, Request, UseGuards } from '@nestjs/common';
import { AuthService, LocalAuthGuard, SkipAuth } from '@pictode-api/auth';
import { User } from '@prisma/client';
import { UserService } from './user.service';

@Controller('user')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly authService: AuthService,
  ) {}

  @Post('signup')
  async signupUser(@Body() userData: { name?: string; email: string; password: string }): Promise<User> {
    return this.userService.createUser(userData);
  }

  @SkipAuth()
  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@Request() req: Express.Request): Promise<any> {
    const user = req.user as User;
    this.userService.cacheUser(user);
    return this.authService.login(user);
  }

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
