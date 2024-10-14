import { Inject, Injectable } from '@nestjs/common';
import { UserService as IUserService, ResourcePayload, UserPayload } from '@pictode-api/auth';
import { Cache } from '@pictode-api/cache';
import { PrismaService } from '@pictode-api/prisma';
import { Permission, Prisma, User } from '@prisma/client';

@Injectable()
export class UserService implements IUserService<User> {
  constructor(
    private prisma: PrismaService,
    @Inject('Cache')
    private cache: Cache,
  ) {}

  async canAccess({ id }: UserPayload, permission: ResourcePayload): Promise<boolean> {
    // 合并所有权限
    const user = await this.cache.get<User & { permissions: Permission[] }>(`user:${id}`);

    // 创建一个正则表达式来匹配请求的资源;
    const requestRegex = new RegExp('^' + permission.resource.replace(/:\w+/g, '[^/]+') + '$');

    // 检查是否包含所需的权限
    return user.permissions.some((p) => p.action === permission.action && requestRegex.test(p.resource));
  }

  async validateUser(username: string, password: string): Promise<User> {
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

  async cacheUser({ id }: User) {
    const user = await this.prisma.user.findUnique({
      where: { id: +id },
      include: {
        permissions: true,
        roles: true,
      },
    });

    // 缓存用户信息
    await this.cache.set(`user:${user.id}`, user);
  }

  private deduplicatePermissions(permissions: Permission[]): Permission[] {
    const uniquePermissions = new Map<string, Permission>();

    for (const permission of permissions) {
      const key = `${permission.action}:${permission.resource}`;
      if (!uniquePermissions.has(key)) {
        uniquePermissions.set(key, permission);
      }
    }

    return Array.from(uniquePermissions.values());
  }

  async user(userWhereUniqueInput: Prisma.UserWhereUniqueInput): Promise<User | null> {
    return this.prisma.user.findUnique({ where: userWhereUniqueInput });
  }

  async users(params: {
    skip?: number;
    take?: number;
    cursor?: Prisma.UserWhereUniqueInput;
    where?: Prisma.UserWhereInput;
    orderBy?: Prisma.UserOrderByWithRelationInput;
  }): Promise<User[]> {
    const { skip, take, cursor, where, orderBy } = params;
    return this.prisma.user.findMany({
      skip,
      take,
      cursor,
      where,
      orderBy,
      include: {
        roles: true,
      },
    });
  }

  async createUser(data: Prisma.UserCreateInput): Promise<User> {
    return this.prisma.user.create({
      data,
    });
  }

  async updateUser(params: { where: Prisma.UserWhereUniqueInput; data: Prisma.UserUpdateInput }): Promise<User> {
    const { where, data } = params;
    return this.prisma.user.update({
      data,
      where,
      include: {
        roles: true,
      },
    });
  }

  async deleteUser(where: Prisma.UserWhereUniqueInput): Promise<User> {
    return this.prisma.user.delete({
      where,
    });
  }
}
