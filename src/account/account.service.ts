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
    return await this.prisma.$transaction(async (prisma) => {
      // 1. 获取默认用户角色
      const defaultRole = await prisma.role.findUnique({
        where: { name: 'User' },
      });

      if (!defaultRole) {
        throw new Error('默认用户角色不存在，请确保已运行数据库初始化脚本(prisma db seed)');
      }

      // 2. 创建用户并关联默认角色
      const userEntity = await prisma.user.create({
        data: {
          ...user,
          roles: {
            connect: {
              id: defaultRole.id,
            },
          },
        },
        include: {
          roles: true,
          permissions: true,
        },
      });

      return plainToClass(RegistryVO, userEntity);
    });
  }
}
