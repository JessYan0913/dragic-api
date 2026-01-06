import { SkipAuth } from '@dragic/auth';
import { CaptchaGuard, CaptchaPurpose, ImageCaptchaService } from '@dragic/image-captcha';
import { Body, Controller, HttpCode, HttpStatus, Inject, Post, Res, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { AuthService } from './auth.service';
import { CreateImageCaptchaDTO } from './dto/create-image-captcha.dto';
import { LoginDTO } from './dto/login.dto';
import { RegisterDTO } from './dto/register.dto';
import { VerifyImageCaptchaDTO } from './dto/verify-image-captcha.dto';
import { VerifyImageCaptchaVO } from './vo/verify-image-captcha.vo';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(
    @Inject('LocalAuthService') private readonly authService: AuthService,
    private readonly imageCaptchaService: ImageCaptchaService,
  ) {}

  @Post('/captcha')
  @SkipAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '创建图片验证码' })
  @ApiResponse({ status: 200, description: '创建成功' })
  async createImageCaptcha(@Body() body: CreateImageCaptchaDTO) {
    return this.imageCaptchaService.createCaptcha(body);
  }

  @Post('/captcha/verify')
  @SkipAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '验证图片验证码' })
  @ApiResponse({ status: 200, description: '验证成功' })
  async verifyImageCaptcha(
    @Body() body: VerifyImageCaptchaDTO,
    @Res({ passthrough: true }) response: Response,
  ): Promise<VerifyImageCaptchaVO> {
    const result = await this.imageCaptchaService.verifyCaptcha(body);

    // 设置 Cookie，浏览器会自动携带
    response.cookie('captcha_token', result.token, {
      httpOnly: false, // 允许前端访问
      secure: process.env.NODE_ENV === 'production', // 生产环境使用 HTTPS
      sameSite: 'lax',
      maxAge: 5 * 60 * 1000, // 5分钟过期
    });

    return { id: result.id, token: result.token };
  }

  @Post('/register/email/send')
  @SkipAuth()
  @UseGuards(CaptchaGuard)
  @CaptchaPurpose('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: '发送注册邮箱验证码' })
  @ApiResponse({ status: 201, description: '发送成功' })
  async sendRegisterEmailCaptcah() {
    return this.authService.sendRegisterEmailCaptcah();
  }

  @Post('/register')
  @SkipAuth()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: '用户注册' })
  @ApiResponse({ status: 201, description: '注册成功' })
  async register(@Body() userData: RegisterDTO) {
    return this.authService.register(userData);
  }

  @Post('/login')
  @SkipAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '用户登录' })
  @ApiResponse({ status: 200, description: '登录成功' })
  async login(@Body() loginData: LoginDTO) {
    return this.authService.login(loginData.email, loginData.password);
  }

  @Post('/refresh')
  @SkipAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '刷新访问令牌' })
  @ApiResponse({ status: 200, description: '令牌刷新成功' })
  async refresh(@Body('refreshToken') refreshToken: string) {
    return this.authService.refreshToken(refreshToken);
  }

  @Post('/logout')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '用户登出' })
  @ApiResponse({ status: 200, description: '登出成功' })
  async logout() {
    return this.authService.logout();
  }
}
