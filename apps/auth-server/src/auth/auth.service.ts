import { DrizzleService, users } from '@dragic/database';
import { MailService } from '@dragic/mail';
import { Injectable } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { UserService } from '../user/user.service';
import { welcomeTemplate } from './templates/welcome.template';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly drizzle: DrizzleService,
    private readonly mailService: MailService,
  ) {}

  async register(payload: { name: string; email: string; password: string }) {
    // 检查邮箱是否已存在
    const existingUser = await this.drizzle.db.select().from(users).where(eq(users.email, payload.email)).limit(1);

    if (existingUser.length > 0) {
      throw new Error('Email already exists');
    }

    // 创建新用户
    const [newUser] = await this.drizzle.db
      .insert(users)
      .values({
        name: payload.name,
        email: payload.email,
        password: payload.password, // 实际应用中应该加密
      })
      .returning();

    // 发送欢迎邮件
    try {
      await this.mailService.sendTemplate(newUser.email, welcomeTemplate, {
        name: newUser.name,
        loginUrl: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/login`,
      });
    } catch (error) {
      console.error('发送欢迎邮件失败:', error);
      // 不阻塞注册流程，只记录错误
    }

    return {
      id: newUser.id,
      email: newUser.email,
      name: newUser.name,
    };
  }

  async login(email: string, password: string) {
    const user = await this.userService.validateUser(email, password);
    if (!user) {
      throw new Error('Invalid credentials');
    }

    // TODO: 生成 JWT token 和 refresh token
    return {
      user,
      accessToken: 'jwt-token-here',
      refreshToken: 'refresh-token-here',
    };
  }

  async refreshToken(refreshToken: string) {
    // TODO: 验证 refresh token 并生成新的 access token
    return {
      accessToken: 'new-jwt-token-here',
    };
  }

  async logout() {
    // TODO: 撤销 token
    return { message: 'Logged out successfully' };
  }
}
