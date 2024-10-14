import { Injectable } from '@nestjs/common';
import { PrismaService } from '@pictode-api/prisma';
import { Prisma, Role } from '@prisma/client';

@Injectable()
export class RoleService {
  constructor(private readonly prisma: PrismaService) {}

  async roles(params: {
    skip?: number;
    take?: number;
    cursor?: Prisma.RoleWhereUniqueInput;
    where?: Prisma.RoleWhereInput;
    orderBy?: Prisma.RoleOrderByWithRelationInput;
  }): Promise<Role[]> {
    const { skip, take, cursor, where, orderBy } = params;
    return this.prisma.role.findMany({
      skip,
      take,
      cursor,
      where,
      orderBy,
    });
  }

  async createRole(data: Prisma.RoleCreateInput): Promise<Role> {
    return this.prisma.role.create({
      data,
    });
  }

  async updateRole(params: { where: Prisma.RoleWhereUniqueInput; data: Prisma.RoleUpdateInput }): Promise<Role> {
    const { where, data } = params;
    return this.prisma.role.update({
      data,
      where,
      include: {
        permissions: true,
      },
    });
  }

  async deleteRole(where: Prisma.RoleWhereUniqueInput): Promise<Role> {
    return this.prisma.role.delete({
      where,
    });
  }
}
