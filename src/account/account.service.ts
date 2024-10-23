import { UserService } from '@/user/user.service';
import { Injectable } from '@nestjs/common';
import { AuthService } from '@pictode-api/auth';
import { PrismaService } from '@pictode-api/prisma';
import { Prisma, User } from '@prisma/client';
import { plainToClass } from 'class-transformer';
import { LoginVO } from './vo/login.vo';
import { RegistryVO } from './vo/registry.vo';

@Injectable()
export class AccountService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly userService: UserService,
    private readonly authService: AuthService,
  ) {}

  async login(user: User): Promise<LoginVO> {
    const userEntity = await this.userService.cacheUser(user);
    const { accessToken } = await this.authService.login(user);
    return plainToClass(LoginVO, { accessToken, user: userEntity }, { excludeExtraneousValues: true });
  }

  async registry(user: Prisma.UserCreateInput): Promise<RegistryVO> {
    const userEntity = await this.prisma.user.create({ data: user });
    return plainToClass(RegistryVO, userEntity);
  }
}
