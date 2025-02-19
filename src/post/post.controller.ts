import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CurrentUser } from '@pictode-api/auth';
import { User as UserModel } from '@prisma/client';
import { CreatePostDto } from './dto/create-post.dto';
import { PostService } from './post.service';
import { CreatePostVO } from './vo/create-post.vo';
import { PostDetailVO } from './vo/post-detail.vo';

@Controller('post')
export class PostController {
  constructor(private readonly postService: PostService) {}

  @Post()
  @ApiOperation({ summary: '创建帖子草稿' })
  @ApiResponse({ type: CreatePostVO })
  async createDraft(@CurrentUser() user: UserModel, @Body() createPostDto: CreatePostDto): Promise<CreatePostVO> {
    return this.postService.createPost(user, createPostDto);
  }

  @Get('/:id')
  @ApiOperation({ summary: '获取帖子详情' })
  @ApiResponse({ type: PostDetailVO })
  async getPostById(@Param('id') id: string): Promise<PostDetailVO> {
    return this.postService.post({ id: Number(id) });
  }

  @Get('feed')
  @ApiOperation({ summary: '获取已发布的帖子列表' })
  @ApiResponse({ type: [PostDetailVO] })
  async getPublishedPosts(): Promise<PostDetailVO[]> {
    return this.postService.posts({
      where: { published: true },
    });
  }

  @Get('filtered/:searchString')
  @ApiOperation({ summary: '搜索帖子' })
  @ApiResponse({ type: [PostDetailVO] })
  async getFilteredPosts(@Param('searchString') searchString: string): Promise<PostDetailVO[]> {
    return this.postService.posts({
      where: {
        OR: [
          {
            title: { contains: searchString },
          },
          {
            content: { contains: searchString },
          },
        ],
      },
      take: 2,
    });
  }

  @Put('publish/:id')
  @ApiOperation({ summary: '发布帖子' })
  @ApiResponse({ type: PostDetailVO })
  async publishPost(@Param('id') id: string): Promise<PostDetailVO> {
    return this.postService.updatePost({
      where: { id: Number(id) },
      data: { published: true },
    });
  }

  @Delete('/:id')
  @ApiOperation({ summary: '删除帖子' })
  @ApiResponse({ status: 204, description: '删除成功' })
  async deletePost(@Param('id') id: string): Promise<void> {
    await this.postService.deletePost({ id: Number(id) });
  }
}
