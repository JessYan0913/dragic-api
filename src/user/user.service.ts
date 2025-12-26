import { Inject, Injectable } from '@nestjs/common';
import { UserService as IUserService, ResourcePayload, UserPayload } from '@pictode-api/auth';
import { Cache } from '@pictode-api/cache';
import { DrizzleService, UserRow, users } from '@pictode-api/drizzle';
import { eq } from 'drizzle-orm';
import { plainToClass } from 'class-transformer';
import { UpdateUserVO } from './vo/update-user.vo';
import { UserListVO } from './vo/user-list.vo';

type PermissionEntity = {
  id: number;
  name: string;
  description?: string | null;
  resource: string;
  action: string;
};

export type UserEntity = UserRow & {
  roles?: any[];
  permissions?: PermissionEntity[];
};

@Injectable()
export class UserService implements IUserService<UserEntity> {
  constructor(
    private readonly drizzle: DrizzleService,
    @Inject('Cache')
    private readonly cache: Cache,
  ) {}

  async canAccess({ id }: UserPayload, permission: ResourcePayload): Promise<boolean> {
    // 获取用户全部信息
    const user = await this.cache.get<UserEntity & { permissions: PermissionEntity[] }>(`user:${id}`);

    // 检查是否有super_admin权限
    if (user?.permissions?.some((p) => p.name === 'super_admin')) {
      return true;
    }

    // 创建一个正则表达式来匹配请求的资源
    const requestRegex = new RegExp('^' + permission.resource.replace(/:\w+/g, '[^/]+') + '$');

    // 检查是否包含所需的权限
    return user?.permissions?.some((p) => p.action === permission.action && requestRegex.test(p.resource)) ?? false;
  }

  async validateUser(username: string, password: string): Promise<UserEntity | null> {
    const found = await this.drizzle.db.select().from(users).where(eq(users.email, username)).limit(1);
    const user = found[0];
    if (!user || user.password !== password) {
      return null;
    }

    return {
      ...user,
      roles: [],
    };
  }

  async cacheUser({ id }: UserEntity): Promise<UserEntity> {
    const found = await this.drizzle.db.select().from(users).where(eq(users.id, Number(id))).limit(1);
    const user = found[0];

    const userWithRelations: UserEntity = {
      ...user,
      roles: [],
      permissions: [],
    };

    // 缓存用户信息
    await this.cache.set(`user:${userWithRelations.id}`, userWithRelations);
    return userWithRelations;
  }

  async users(params: {
    skip?: number;
    take?: number;
    cursor?: any;
    where?: any;
    orderBy?: any;
  }): Promise<UserListVO> {
    const { skip, take } = params;
    const result = await this.drizzle.db
      .select({
        id: users.id,
        email: users.email,
        username: users.name,
      })
      .from(users)
      .offset(skip ?? 0)
      .limit(take ?? 100);

    const mapped = result.map((u) => ({
      id: u.id,
      email: u.email,
      username: u.username ?? '',
      role: '',
    }));

    return plainToClass(UserListVO, { users: mapped });
  }

  async updateUser(params: {
    where: { id: number };
    data: { name?: string; email?: string };
  }): Promise<UpdateUserVO> {
    const { where, data } = params;
    const [updatedUser] = await this.drizzle.db
      .update(users)
      .set({
        ...(data.email !== undefined ? { email: data.email } : {}),
        ...(data.name !== undefined ? { name: data.name } : {}),
      })
      .where(eq(users.id, Number(where.id)))
      .returning();

    // 使用 plainToClass 转换为 UserUpdateVO
    return plainToClass(UpdateUserVO, updatedUser);
  }

  async deleteUser(where: { id: number }): Promise<UserEntity> {
    const [deleted] = await this.drizzle.db.delete(users).where(eq(users.id, Number(where.id))).returning();
    return deleted;
  }
}
