import { Inject, Injectable } from '@nestjs/common';
import { UserService as IUserService, ResourcePayload, UserPayload } from '@pictode-api/auth';
import { Cache } from '@pictode-api/cache';
import { PrismaService } from '@pictode-api/prisma';
import { Permission, Prisma, User } from '@prisma/client';
import { plainToClass } from 'class-transformer';
import { SetPermissionsVO } from './vo/set-permissions.vo';
import { SetRolesVO } from './vo/set-roles.vo';
import { UpdateUserVO } from './vo/update-user.vo';
import { UserListVO } from './vo/user-list.vo';

@Injectable()
export class UserService implements IUserService<User> {
  constructor(
    private readonly prisma: PrismaService,
    @Inject('Cache')
    private readonly cache: Cache,
  ) {}

  async canAccess({ id }: UserPayload, permission: ResourcePayload): Promise<boolean> {
    // 获取用户全部信息
    const user = await this.cache.get<User & { permissions: Permission[] }>(`user:${id}`);

    // 检查是否有super_admin权限
    if (user.permissions.some((p) => p.name === 'super_admin')) {
      return true;
    }

    // 创建一个正则表达式来匹配请求的资源
    const requestRegex = new RegExp('^' + permission.resource.replace(/:\w+/g, '[^/]+') + '$');

    // 检查是否包含所需的权限
    return user.permissions.some((p) => p.action === permission.action && requestRegex.test(p.resource));
  }

  async validateUser(username: string, password: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({
      where: { email: username },
      include: {
        roles: true,
      },
    });
    if (!user || user.password !== password) {
      return null;
    }
    return user;
  }

  async cacheUser({ id }: User): Promise<User> {
    const user = await this.prisma.user.findUnique({
      where: { id: +id },
      include: {
        permissions: true,
        roles: true,
      },
    });

    // 缓存用户信息
    await this.cache.set(`user:${user.id}`, user);
    return user;
  }

  async users(params: {
    skip?: number;
    take?: number;
    cursor?: Prisma.UserWhereUniqueInput;
    where?: Prisma.UserWhereInput;
    orderBy?: Prisma.UserOrderByWithRelationInput;
  }): Promise<UserListVO> {
    const { skip, take, cursor, where, orderBy } = params;
    const users = await this.prisma.user.findMany({
      skip,
      take,
      cursor,
      where,
      orderBy,
      include: {
        roles: true,
      },
    });
    return plainToClass(UserListVO, { users });
  }

  async updateUser(params: {
    where: Prisma.UserWhereUniqueInput;
    data: Prisma.UserUpdateInput;
  }): Promise<UpdateUserVO> {
    const { where, data } = params;
    const updatedUser = await this.prisma.user.update({
      data,
      where,
      include: {
        roles: true,
      },
    });

    // 使用 plainToClass 转换为 UserUpdateVO
    return plainToClass(UpdateUserVO, updatedUser);
  }

  async deleteUser(where: Prisma.UserWhereUniqueInput): Promise<User> {
    return this.prisma.user.delete({
      where,
    });
  }

  async setRoles(userId: number, roleIds: number[]): Promise<SetRolesVO> {
    // 假设你有逻辑来更新用户角色
    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: {
        roles: {
          set: roleIds.map((roleId) => ({ id: roleId })),
        },
      },
      include: {
        roles: true,
      },
    });

    return plainToClass(SetRolesVO, updatedUser);
  }

  async setPermissions(userId: number, permissions: number[]): Promise<SetPermissionsVO> {
    const updateUser = await this.prisma.user.update({
      where: { id: Number(userId) },
      data: {
        permissions: {
          set: permissions.map((permission) => ({ id: permission })),
        },
      },
      include: {
        permissions: true,
      },
    });
    return plainToClass(SetPermissionsVO, updateUser);
  }
}
