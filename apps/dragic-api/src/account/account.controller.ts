import { Body, Controller, Post } from '@nestjs/common';
import { AuthService, SkipAuth } from '@dragic/auth';
import { LoginDTO } from './dto/login.dto';
import { RegisterDTO } from './dto/register.dto';

@Controller('account')
export class AccountController {
  constructor(private readonly authService: AuthService) {}

  @SkipAuth()
  @Post('register')
  async register(@Body() userData: RegisterDTO) {}

  @SkipAuth()
  @Post('login')
  async login(@Body() userData: LoginDTO) {}
}
