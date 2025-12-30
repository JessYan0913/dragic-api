import { UserService as IUserService, OAuthUserProfile, ResourcePayload, UserPayload } from '@dragic/auth';
import { DrizzleService, userAuthIdentities, UserRow, users } from '@dragic/database';
import { Injectable, BadRequestException } from '@nestjs/common';
import { and, eq } from 'drizzle-orm';

@Injectable()
export class UserService implements IUserService<UserPayload> {
  constructor(private readonly drizzle: DrizzleService) {}

  async validateUser(username: string, password: string): Promise<UserPayload | null> {
    const result = await this.drizzle.db.select().from(users).where(eq(users.email, username)).limit(1);

    if (result.length === 0) {
      return null;
    }

    const user = result[0];
    // In production, use proper password hashing (bcrypt)
    if (user.password !== password) {
      return null;
    }

    return this.toUserPayload(user);
  }

  async canAccess(user: UserPayload, resource: ResourcePayload): Promise<boolean> {
    // Implement your authorization logic here
    return true;
  }

  async findOrCreateByOAuth(profile: OAuthUserProfile): Promise<UserPayload> {
    // Check if identity already exists
    const existingIdentity = await this.drizzle.db
      .select()
      .from(userAuthIdentities)
      .where(
        and(
          eq(userAuthIdentities.provider, profile.provider),
          eq(userAuthIdentities.providerUserId, profile.providerUserId),
        ),
      )
      .limit(1);

    if (existingIdentity.length > 0) {
      // Identity exists, get the user
      const userResult = await this.drizzle.db
        .select()
        .from(users)
        .where(eq(users.id, existingIdentity[0].userId))
        .limit(1);

      if (userResult.length > 0) {
        return this.toUserPayload(userResult[0]);
      }
    }

    // Create new user
    const newUser = await this.drizzle.db
      .insert(users)
      .values({
        name: profile.name,
        email: profile.email,
        phone: profile.phone,
      })
      .returning();

    // Create identity link
    await this.drizzle.db.insert(userAuthIdentities).values({
      userId: newUser[0].id,
      provider: profile.provider,
      providerUserId: profile.providerUserId,
      unionId: profile.unionId,
      openId: profile.openId,
      raw: JSON.stringify(profile.raw),
    });

    return this.toUserPayload(newUser[0]);
  }

  async findOrCreateByPhone(phone: string): Promise<UserPayload> {
    // Check if user with phone exists
    const existingUser = await this.drizzle.db.select().from(users).where(eq(users.phone, phone)).limit(1);

    if (existingUser.length > 0) {
      return this.toUserPayload(existingUser[0]);
    }

    // Create new user
    const newUser = await this.drizzle.db.insert(users).values({ phone }).returning();

    return this.toUserPayload(newUser[0]);
  }

  async findById(id: number): Promise<UserPayload | null> {
    const result = await this.drizzle.db.select().from(users).where(eq(users.id, id)).limit(1);

    if (result.length === 0) {
      return null;
    }

    return this.toUserPayload(result[0]);
  }

  async updateUser(id: number, updateData: { name?: string; email?: string; phone?: string }) {
    const [updatedUser] = await this.drizzle.db
      .update(users)
      .set(updateData)
      .where(eq(users.id, id))
      .returning();

    if (!updatedUser) {
      throw new BadRequestException('用户不存在');
    }

    return this.toUserPayload(updatedUser);
  }

  async changePassword(id: number, passwordData: { currentPassword: string; newPassword: string }) {
    // 获取用户当前密码
    const [user] = await this.drizzle.db
      .select()
      .from(users)
      .where(eq(users.id, id))
      .limit(1);

    if (!user) {
      throw new BadRequestException('用户不存在');
    }

    // 验证当前密码
    if (user.password !== passwordData.currentPassword) {
      throw new BadRequestException('当前密码错误');
    }

    // 更新密码
    await this.drizzle.db
      .update(users)
      .set({ password: passwordData.newPassword })
      .where(eq(users.id, id));

    return { message: '密码修改成功' };
  }

  private toUserPayload(user: UserRow): UserPayload {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      phone: user.phone,
    };
  }
}
