import { Injectable } from '@nestjs/common';
import { PrismaService } from '@pictode-api/prisma';
import { Prisma } from '@prisma/client';
import { plainToClass } from 'class-transformer';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { CreatePermissionVO } from './vo/create-permission.vo';
import { DeletePermissionVO } from './vo/delete-permission.vo';
import { PermissionListVO } from './vo/permission-list.vo';
import { UpdatePermissionVO } from './vo/update-permission.vo';

@Injectable()
export class PermissionService {
  constructor(private readonly prisma: PrismaService) {}

  async permissions(params: {
    skip?: number;
    take?: number;
    cursor?: Prisma.PermissionWhereUniqueInput;
    where?: Prisma.PermissionWhereInput;
    orderBy?: Prisma.PermissionOrderByWithRelationInput;
  }): Promise<PermissionListVO> {
    const permissions = await this.prisma.permission.findMany({
      skip: params.skip,
      take: params.take,
      cursor: params.cursor,
      where: params.where,
      orderBy: params.orderBy,
    });
    return plainToClass(PermissionListVO, { permissions });
  }

  async createPermission(data: CreatePermissionDto): Promise<CreatePermissionVO> {
    const permission = await this.prisma.permission.create({ data });
    return plainToClass(CreatePermissionVO, permission);
  }

  async updatePermission(params: {
    where: Prisma.PermissionWhereUniqueInput;
    data: Prisma.PermissionUpdateInput;
  }): Promise<UpdatePermissionVO> {
    const permission = await this.prisma.permission.update(params);
    return plainToClass(UpdatePermissionVO, permission);
  }

  async deletePermission(id: number): Promise<DeletePermissionVO> {
    const permission = await this.prisma.permission.delete({ where: { id } });
    return plainToClass(DeletePermissionVO, permission);
  }
}
