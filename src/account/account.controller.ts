import { Body, Controller, Post, Request, UseGuards } from '@nestjs/common';
import { LocalAuthGuard, SkipAuth } from '@pictode-api/auth';
import { User } from '@prisma/client';
import { AccountService } from './account.service';

@Controller('account')
export class AccountController {
  constructor(private readonly accountService: AccountService) {}

  @SkipAuth()
  @Post('registry')
  async registry(@Body() userData: { name?: string; email: string; password: string }): Promise<User> {
    return this.accountService.registry(userData);
  }

  @SkipAuth()
  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@Request() req: Express.Request): Promise<{ accessToken: string; user: Omit<User, 'password'> }> {
    return this.accountService.login(req.user as User);
  }
}
