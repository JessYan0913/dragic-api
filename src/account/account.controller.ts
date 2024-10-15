import { Body, Controller, Post, Request, UseGuards } from '@nestjs/common';
import { LocalAuthGuard, SkipAuth } from '@pictode-api/auth';
import { User } from '@prisma/client';
import { AccountService } from './account.service';
import { RegistryDTO } from './dto/registry.dto';
import { LoginVo } from './vo/login.vo';
import { RegistryVo } from './vo/registry.vo';

@Controller('account')
export class AccountController {
  constructor(private readonly accountService: AccountService) {}

  @SkipAuth()
  @Post('registry')
  async registry(@Body() userData: RegistryDTO): Promise<RegistryVo> {
    return this.accountService.registry(userData);
  }

  @SkipAuth()
  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@Request() req: Express.Request): Promise<LoginVo> {
    return this.accountService.login(req.user as User);
  }
}
