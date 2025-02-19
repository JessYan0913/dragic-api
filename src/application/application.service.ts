import { Injectable } from '@nestjs/common';
import { PrismaService } from '@pictode-api/prisma';
import { CreateApplicationDto } from './dto/create-application.dto';
import { PaginationApplicationDto } from './dto/pagination-application.dto';
import { UpdateApplicationDto } from './dto/update-application.dto';
import { plainToClass } from 'class-transformer';
import { CreateApplicationVO } from './vo/create-application.vo';
import { ApplicationDetailVO } from './vo/application-detail.vo';
import { ApplicationListVO } from './vo/application-list.vo';
import { NotFoundException } from '@nestjs/common';

@Injectable()
export class ApplicationService {
  constructor(private prisma: PrismaService) {}

  async create(createDto: CreateApplicationDto): Promise<CreateApplicationVO> {
    const application = await this.prisma.application.create({
      data: {
        ...createDto,
        creator: { connect: { id: 1 } }, // 临时使用测试用户ID
      },
      include: { creator: true },
    });
    return plainToClass(CreateApplicationVO, application);
  }

  async findAll({ page = 1, pageSize = 10 }: PaginationApplicationDto): Promise<ApplicationListVO[]> {
    const skip = (page - 1) * pageSize;
    const applications = await this.prisma.application.findMany({
      skip,
      take: pageSize,
      include: { creator: true, pages: true },
      orderBy: { createdAt: 'desc' },
    });

    return applications.map(app => plainToClass(ApplicationListVO, {
      ...app,
      creatorName: app.creator.name,
      pageCount: app.pages.length,
    }));
  }

  async findOne(id: number): Promise<ApplicationDetailVO> {
    const application = await this.prisma.application.findUnique({
      where: { id },
      include: { creator: true, pages: true },
    });
    return plainToClass(ApplicationDetailVO, application);
  }

  async update(id: number, updateDto: UpdateApplicationDto): Promise<ApplicationDetailVO> {
    const application = await this.prisma.application.update({
      where: { id },
      data: updateDto,
      include: { creator: true, pages: true },
    });
    return plainToClass(ApplicationDetailVO, application);
  }

  async remove(id: number): Promise<void> {
    const application = await this.prisma.application.findUnique({
      where: { id },
      include: { pages: true },
    });

    if (!application) {
      throw new NotFoundException(`应用ID ${id} 不存在`);
    }

    // 删除应用及其关联的页面
    await this.prisma.$transaction([
      // 先删除所有关联的页面
      this.prisma.page.deleteMany({
        where: { applicationId: id },
      }),
      // 然后删除应用本身
      this.prisma.application.delete({
        where: { id },
      }),
    ]);
  }
}
