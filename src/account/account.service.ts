import { UserService } from '@/user/user.service';
import { Injectable } from '@nestjs/common';
import { AuthService } from '@pictode-api/auth';
import { PrismaService } from '@pictode-api/prisma';
import { Prisma, User } from '@prisma/client';
import { plainToClass } from 'class-transformer';
import { LoginVo } from './mapper/account.login';
import { RegistryAccountVo } from './mapper/account.registry';

@Injectable()
export class AccountService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly userService: UserService,
    private readonly authService: AuthService,
  ) {}

  async login(user: User): Promise<LoginVo> {
    const userEntity = await this.userService.cacheUser(user);
    const { accessToken } = await this.authService.login(user);
    return plainToClass(
      LoginVo,
      { accessToken, user: userEntity },
      {
        excludeExtraneousValues: true,
      },
    );
  }

  async registry(user: Prisma.UserCreateInput): Promise<RegistryAccountVo> {
    const userEntity = await this.prisma.user.create({ data: user });
    return plainToClass(RegistryAccountVo, userEntity, {
      excludeExtraneousValues: true,
    });
  }
}
