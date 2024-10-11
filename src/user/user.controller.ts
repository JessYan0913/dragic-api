import { Body, Controller, Get, Post, Request, UseGuards } from '@nestjs/common';
import { AuthService, LocalAuthGuard, SkipAuth } from '@pictode-api/auth';
import { User as UserModel } from '@prisma/client';
import { UserService } from './user.service';

@Controller('user')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly authService: AuthService,
  ) {}

  @Post('signup')
  async signupUser(@Body() userData: { name?: string; email: string; password: string }): Promise<UserModel> {
    return this.userService.createUser(userData);
  }

  @SkipAuth()
  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@Request() req: Express.Request): Promise<any> {
    return this.authService.login(req.user);
  }

  @Get('all')
  async findAll(): Promise<UserModel[]> {
    return this.userService.findAll();
  }
}
