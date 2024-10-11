import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@pictode-api/auth';
import { User as UserModel } from '@prisma/client';
import { UserService } from './user.service';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('signup')
  async signupUser(@Body() userData: { name?: string; email: string; password: string }): Promise<UserModel> {
    return this.userService.createUser(userData);
  }

  @Post('login')
  async login(@Body() userData: { email: string; password: string }): Promise<string> {
    return this.userService.login(userData);
  }

  @UseGuards(AuthGuard)
  @Get('all')
  async findAll(): Promise<UserModel[]> {
    return this.userService.findAll();
  }
}
