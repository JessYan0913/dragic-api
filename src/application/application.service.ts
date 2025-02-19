import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@pictode-api/prisma';
import { plainToClass } from 'class-transformer';
import { CreateApplicationDto } from './dto/create-application.dto';
import { CreatePageDto } from './dto/create-page.dto';
import { PaginationApplicationDto } from './dto/pagination-application.dto';
import { UpdateApplicationDto } from './dto/update-application.dto';
import { UpdatePageDto } from './dto/update-page.dto';
import { ApplicationDetailVO } from './vo/application-detail.vo';
import { ApplicationListVO } from './vo/application-list.vo';
import { CreateApplicationVO } from './vo/create-application.vo';
import { CreatePageVO } from './vo/create-page.vo';
import { PageDetailVO } from './vo/page-detail.vo';
import { UpdatePageVO } from './vo/update-page.vo';

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

    if (!application) {
      throw new NotFoundException(`应用ID ${id} 不存在`);
    }

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
    await this.prisma.application.delete({
      where: { id },
    });
  }

  // 页面管理相关方法
  async createPage(applicationId: number, createPageDto: CreatePageDto): Promise<CreatePageVO> {
    const page = await this.prisma.page.create({
      data: {
        ...createPageDto,
        application: {
          connect: { id: applicationId }
        }
      },
    });
    return plainToClass(CreatePageVO, page);
  }

  async findPageById(id: number): Promise<PageDetailVO> {
    const page = await this.prisma.page.findUnique({
      where: { id },
    });

    if (!page) {
      throw new NotFoundException(`页面ID ${id} 不存在`);
    }

    return plainToClass(PageDetailVO, page);
  }

  async findPagesByApplicationId(applicationId: number): Promise<PageDetailVO[]> {
    const pages = await this.prisma.page.findMany({
      where: { applicationId },
      orderBy: { createdAt: 'desc' },
    });
    return pages.map(page => plainToClass(PageDetailVO, page));
  }

  async updatePage(id: number, updatePageDto: UpdatePageDto): Promise<UpdatePageVO> {
    const page = await this.prisma.page.update({
      where: { id },
      data: updatePageDto,
    });
    return plainToClass(UpdatePageVO, page);
  }

  async removePage(id: number): Promise<void> {
    await this.prisma.page.delete({
      where: { id },
    });
  }
}
