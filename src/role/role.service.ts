import { Injectable } from '@nestjs/common';
import { PrismaService } from '@pictode-api/prisma';
import { Prisma, Role } from '@prisma/client';
import { plainToClass } from 'class-transformer';
import { CreateRoleDto } from './dto/create-role.dto';
import { CreateRoleVO } from './vo/create-role.vo';
import { DeleteRoleVO } from './vo/delete-role.vo';
import { UpdateRoleVO } from './vo/update-role.vo';

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

  async createRole(data: CreateRoleDto): Promise<CreateRoleVO> {
    const role = await this.prisma.role.create({
      data: {
        name: data.name,
      },
    });

    // 使用class-transformer转换为VO对象
    return plainToClass(CreateRoleVO, role);
  }

  async updateRole(params: {
    where: Prisma.RoleWhereUniqueInput;
    data: Prisma.RoleUpdateInput;
  }): Promise<UpdateRoleVO> {
    const { where, data } = params;
    const role = await this.prisma.role.update({
      data,
      where,
      include: {
        permissions: true,
      },
    });
    return plainToClass(UpdateRoleVO, role);
  }

  async deleteRole(where: Prisma.RoleWhereUniqueInput): Promise<DeleteRoleVO> {
    const role = await this.prisma.role.delete({
      where,
    });
    return plainToClass(DeleteRoleVO, role);
  }
}
