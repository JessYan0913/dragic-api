import { Injectable } from '@nestjs/common';
import { UserService as IUserService } from '@pictode-api/auth';
import { PrismaService } from '@pictode-api/prisma';
import { Prisma, User } from '@prisma/client';

@Injectable()
export class UserService implements IUserService<User> {
  constructor(private prisma: PrismaService) {}
  async validateUser(
    username: string,
    password: string,
  ): Promise<{ id: number; name: string | null; email: string; password: string; age: number | null }> {
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

  async findOne(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { email: email },
    });
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
