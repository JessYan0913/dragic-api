import { Inject, Injectable } from '@nestjs/common';
import { AuthService, UserService as IUserService, ResourcePayload, UserPayload } from '@pictode-api/auth';
import { Cache } from '@pictode-api/cache';
import { PrismaService } from '@pictode-api/prisma';
import { Prisma, User } from '@prisma/client';

@Injectable()
export class UserService implements IUserService<User> {
  constructor(
    private prisma: PrismaService,
    private authService: AuthService,
    @Inject('Cache')
    private cache: Cache,
  ) {}

  async canAccess({ id: userId }: UserPayload, permission: ResourcePayload): Promise<boolean> {
    const user = await this.prisma.user.findUnique({
      where: { id: +userId },
      include: {
        permissions: true,
        roles: {
          include: {
            permissions: true,
          },
        },
      },
    });

    if (!user) return false;

    // 检查用户直接拥有的权限
    const userPermissions = user.permissions;

    // 检查用户通过角色获得的权限
    const rolePermissions = user.roles.flatMap((role) => role.permissions);

    // 合并所有权限
    const allPermissions = [...userPermissions, ...rolePermissions];

    // 创建一个正则表达式来匹配请求的资源
    const requestRegex = new RegExp('^' + permission.resource.replace(/:\w+/g, '[^/]+') + '$');

    // 检查是否包含所需的权限
    return allPermissions.some((p) => p.action === permission.action && requestRegex.test(p.resource));
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

  async login(user: User) {
    const { permissions, roles } = await this.prisma.user.findUnique({
      where: { id: +user.id },
      include: {
        permissions: true,
        roles: {
          include: {
            permissions: true,
          },
        },
      },
    });
    // 检查用户直接拥有的权限
    const userPermissions = permissions;
    // 检查用户通过角色获得的权限
    const rolePermissions = roles.flatMap((role) => role.permissions);
    // 合并所有权限
    const allPermissions = [...userPermissions, ...rolePermissions];
    this.cache.set(`${user.id}`, allPermissions);
    return this.authService.login(user);
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
