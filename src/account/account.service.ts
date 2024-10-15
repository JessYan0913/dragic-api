import { UserService } from '@/user/user.service';
import { Injectable } from '@nestjs/common';
import { AuthService } from '@pictode-api/auth';
import { PrismaService } from '@pictode-api/prisma';
import { Prisma, User } from '@prisma/client';

@Injectable()
export class AccountService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly userService: UserService,
    private readonly authService: AuthService,
  ) {}

  async login(user: User): Promise<{ accessToken: string; user: Omit<User, 'password'> }> {
    const { password, ...result } = await this.userService.cacheUser(user);
    const { accessToken } = await this.authService.login(user);
    return { accessToken: accessToken, user: result };
  }

  async registry(user: Prisma.UserCreateInput): Promise<User> {
    return await this.prisma.user.create({ data: user });
  }
}
