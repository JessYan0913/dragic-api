import { Body, Controller, Delete, Get, HttpCode, HttpStatus, NotFoundException, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ApplicationService } from './application.service';
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

@ApiTags('应用管理')
@Controller('applications')
export class ApplicationController {
  constructor(private readonly applicationService: ApplicationService) {}

  @Post()
  @ApiOperation({ summary: '创建应用' })
  @ApiResponse({ type: CreateApplicationVO })
  create(@Body() createApplicationDto: CreateApplicationDto): Promise<CreateApplicationVO> {
    return this.applicationService.create(createApplicationDto);
  }

  @Get()
  @ApiOperation({ summary: '获取应用列表' })
  @ApiResponse({ type: [ApplicationListVO] })
  findAll(@Query() paginationDto: PaginationApplicationDto): Promise<ApplicationListVO[]> {
    return this.applicationService.findAll(paginationDto);
  }

  @Get(':id')
  @ApiOperation({ summary: '获取应用详情' })
  @ApiResponse({ type: ApplicationDetailVO })
  findOne(@Param('id') id: string): Promise<ApplicationDetailVO> {
    return this.applicationService.findOne(+id);
  }

  @Patch(':id')
  @ApiOperation({ summary: '更新应用信息' })
  @ApiResponse({ type: ApplicationDetailVO })
  update(@Param('id') id: string, @Body() updateApplicationDto: UpdateApplicationDto): Promise<ApplicationDetailVO> {
    return this.applicationService.update(+id, updateApplicationDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除应用' })
  @ApiResponse({ status: 204, description: '删除成功' })
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string): Promise<void> {
    await this.applicationService.remove(+id);
  }

  // 页面管理相关接口
  @Post(':id/pages')
  @ApiOperation({ summary: '创建页面', description: '为指定应用创建新的页面' })
  @ApiResponse({ type: CreatePageVO })
  async createPage(
    @Param('id') applicationId: string,
    @Body() createPageDto: CreatePageDto,
  ): Promise<CreatePageVO> {
    return this.applicationService.createPage(+applicationId, createPageDto);
  }

  @Get(':id/pages')
  @ApiOperation({ summary: '获取应用页面列表', description: '获取指定应用的所有页面' })
  @ApiResponse({ type: [PageDetailVO] })
  async getApplicationPages(@Param('id') applicationId: string): Promise<PageDetailVO[]> {
    return this.applicationService.findPagesByApplicationId(+applicationId);
  }

  @Get(':id/pages/:pageId')
  @ApiOperation({ summary: '获取页面详情', description: '获取指定页面的详细信息' })
  @ApiResponse({ type: PageDetailVO })
  async getPageDetail(
    @Param('id') applicationId: string,
    @Param('pageId') pageId: string,
  ): Promise<PageDetailVO> {
    const page = await this.applicationService.findPageById(+pageId);
    if (page.applicationId !== +applicationId) {
      throw new NotFoundException('页面不属于指定的应用');
    }
    return page;
  }

  @Patch(':id/pages/:pageId')
  @ApiOperation({ summary: '更新页面', description: '更新指定页面的信息' })
  @ApiResponse({ type: UpdatePageVO })
  async updatePage(
    @Param('id') applicationId: string,
    @Param('pageId') pageId: string,
    @Body() updatePageDto: UpdatePageDto,
  ): Promise<UpdatePageVO> {
    const page = await this.applicationService.findPageById(+pageId);
    if (page.applicationId !== +applicationId) {
      throw new NotFoundException('页面不属于指定的应用');
    }
    return this.applicationService.updatePage(+pageId, updatePageDto);
  }

  @Delete(':id/pages/:pageId')
  @ApiOperation({ summary: '删除页面', description: '删除指定的页面' })
  @ApiResponse({ status: 204, description: '删除成功' })
  @HttpCode(HttpStatus.NO_CONTENT)
  async removePage(
    @Param('id') applicationId: string,
    @Param('pageId') pageId: string,
  ): Promise<void> {
    const page = await this.applicationService.findPageById(+pageId);
    if (page.applicationId !== +applicationId) {
      throw new NotFoundException('页面不属于指定的应用');
    }
    await this.applicationService.removePage(+pageId);
  }
}
