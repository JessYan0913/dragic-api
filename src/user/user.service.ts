import { Inject, Injectable } from '@nestjs/common';
import { UserService as IUserService, ResourcePayload, UserPayload } from '@pictode-api/auth';
import { Cache } from '@pictode-api/cache';
import { PrismaService } from '@pictode-api/prisma';
import { Permission, Prisma, User } from '@prisma/client';

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

    // 创建一个正则表达式来匹配请求的资源;
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

  async setRoles(params: { userId: string; roleIds: string[] }): Promise<User> {
    const { userId, roleIds } = params;

    // 1. 更新用户的角色
    const updatedUser = await this.prisma.user.update({
      where: { id: Number(userId) },
      data: {
        roles: {
          set: roleIds.map((roleId) => ({ id: +roleId })),
        },
      },
      include: {
        roles: {
          include: {
            permissions: true,
          },
        },
        permissions: true, // 包含用户直接拥有的权限
      },
    });

    // 2. 获取所有角色的权限
    const rolePermissions = updatedUser.roles.flatMap((role) => role.permissions);

    // 3. 合并用户直接拥有的权限和角色权限，并去重
    const allPermissions = this.deduplicatePermissions([...updatedUser.permissions, ...rolePermissions]);

    // 4. 更新用户的权限
    const userWithUpdatedPermissions = await this.prisma.user.update({
      where: { id: Number(userId) },
      data: {
        permissions: {
          set: allPermissions.map((permission) => ({ id: permission.id })),
        },
      },
      include: {
        roles: true,
        permissions: true,
      },
    });

    // 5. 更新缓存
    await this.cacheUser(userWithUpdatedPermissions);

    return userWithUpdatedPermissions;
  }

  async setPermissions({ userId, permissions }: { userId: string; permissions: string[] }): Promise<User> {
    const userWithUpdatedPermissions = await this.prisma.user.update({
      where: { id: Number(userId) },
      data: {
        permissions: {
          set: permissions.map((permission) => ({ id: +permission })),
        },
      },
      include: {
        roles: true,
        permissions: true,
      },
    });
    await this.cacheUser(userWithUpdatedPermissions);
    return userWithUpdatedPermissions;
  }

  // 辅助方法：去重权限
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
}
