import { Injectable } from '@nestjs/common';
import { PrismaService } from '@pictode-api/prisma';
import { Prisma, Role } from '@prisma/client';
import { plainToClass } from 'class-transformer';
import { CreateRoleDto } from './dto/create-role.dto';
import { CreateRoleVO } from './vo/create-role.vo';
import { DeleteRoleVO } from './vo/delete-role.vo';
import { RoleListVO, RoleItemVO } from './vo/role-list.vo';
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
  }): Promise<RoleListVO> {
    const { skip, take, cursor, where, orderBy } = params;
    
    // 获取角色列表
    const roles = await this.prisma.role.findMany({
      skip,
      take,
      cursor,
      where,
      orderBy,
      include: {
        _count: {
          select: {
            permissions: true
          }
        }
      }
    });

    // 获取总数
    const total = await this.prisma.role.count({ where });

    // 转换为VO对象
    const items = roles.map(role => plainToClass(RoleItemVO, {
      ...role,
      permissionCount: role._count.permissions
    }));

    return plainToClass(RoleListVO, { items, total });
  }

  async createRole(data: CreateRoleDto): Promise<CreateRoleVO> {
    const role = await this.prisma.role.create({
      data: {
        name: data.name,
      },
    });

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
      include: {
        permissions: true,
      },
    });
    return plainToClass(DeleteRoleVO, role);
  }
}
