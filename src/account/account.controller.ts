import { Body, Controller, Post, Request, UseGuards } from '@nestjs/common';
import { ApiCreatedResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { LocalAuthGuard, SkipAuth } from '@pictode-api/auth';
import { User } from '@prisma/client';
import { AccountService } from './account.service';
import { RegistryDTO } from './dto/registry.dto';
import { LoginVO } from './vo/login.vo';
import { RegistryVO } from './vo/registry.vo';

@ApiTags('账户管理')
@Controller('account')
export class AccountController {
  constructor(private readonly accountService: AccountService) {}

  @SkipAuth()
  @Post('registry')
  @ApiOperation({ summary: '用户注册', description: '创建新用户账户' })
  @ApiCreatedResponse({
    description: '用户注册成功，返回用户信息。',
    type: RegistryVO,
  })
  async registry(@Body() userData: RegistryDTO): Promise<RegistryVO> {
    return this.accountService.registry(userData);
  }

  @SkipAuth()
  @UseGuards(LocalAuthGuard)
  @Post('login')
  @ApiOperation({ summary: '用户登录', description: '使用用户名和密码登录系统' })
  @ApiCreatedResponse({
    description: '用户登录成功，返回用户的登录信息。',
    type: LoginVO,
  })
  async login(@Request() req: Express.Request): Promise<LoginVO> {
    return await this.accountService.login(req.user as User);
  }
}
