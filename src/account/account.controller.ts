import { Body, Controller, Post, Request, UseGuards } from '@nestjs/common';
import { ApiCreatedResponse } from '@nestjs/swagger';
import { LocalAuthGuard, SkipAuth } from '@pictode-api/auth';
import { User } from '@prisma/client';
import { AccountService } from './account.service';
import { RegistryDTO } from './dto/registry.dto';
import { LoginVO } from './vo/login.vo';
import { RegistryVO } from './vo/registry.vo';

@Controller('account')
export class AccountController {
  constructor(private readonly accountService: AccountService) {}

  @SkipAuth()
  @ApiCreatedResponse({
    description: '用户注册成功，返回用户信息。',
    type: RegistryVO,
  })
  @Post('registry')
  async registry(@Body() userData: RegistryDTO): Promise<RegistryVO> {
    return this.accountService.registry(userData);
  }

  @SkipAuth()
  @UseGuards(LocalAuthGuard)
  @ApiCreatedResponse({
    description: '用户登录成功，返回用户的登录信息。',
    type: LoginVO,
  })
  @Post('login')
  async login(@Request() req: Express.Request): Promise<LoginVO> {
    return this.accountService.login(req.user as User);
  }
}
