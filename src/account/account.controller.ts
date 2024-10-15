import { Body, Controller, Post, Request, UseGuards } from '@nestjs/common';
import { LocalAuthGuard, SkipAuth } from '@pictode-api/auth';
import { User } from '@prisma/client';
import { AccountService } from './account.service';
import { LoginVo } from './mapper/account.login';
import { RegistryAccountDTO, RegistryAccountVo } from './mapper/account.registry';

@Controller('account')
export class AccountController {
  constructor(private readonly accountService: AccountService) {}

  @SkipAuth()
  @Post('registry')
  async registry(@Body() userData: RegistryAccountDTO): Promise<RegistryAccountVo> {
    return this.accountService.registry(userData);
  }

  @SkipAuth()
  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@Request() req: Express.Request): Promise<LoginVo> {
    return this.accountService.login(req.user as User);
  }
}
