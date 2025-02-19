import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ApplicationService } from './application.service';
import { CreateApplicationDto } from './dto/create-application.dto';
import { PaginationApplicationDto } from './dto/pagination-application.dto';
import { UpdateApplicationDto } from './dto/update-application.dto';
import { ApplicationDetailVO } from './vo/application-detail.vo';
import { ApplicationListVO } from './vo/application-list.vo';
import { CreateApplicationVO } from './vo/create-application.vo';

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
}
