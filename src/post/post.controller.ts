import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { CurrentUser } from '@pictode-api/auth';
import { Post as PostModel, User as UserModel } from '@prisma/client';
import { PostService } from './post.service';

@Controller('post')
export class PostController {
  constructor(private readonly postService: PostService) {}

  @Post()
  async createDraft(
    @CurrentUser() user: UserModel,
    @Body() postData: { title: string; content?: string },
  ): Promise<PostModel> {
    const { title, content } = postData;
    return this.postService.createPost({
      title,
      content,
      author: {
        connect: { email: user.email },
      },
    });
  }

  @Get('/:id')
  async getPostById(@Param('id') id: string): Promise<PostModel> {
    return this.postService.post({ id: Number(id) });
  }

  @Get('feed')
  async getPublishedPosts(): Promise<PostModel[]> {
    return this.postService.posts({
      where: { published: true },
    });
  }

  @Get('filtered/:searchString')
  async getFilteredPosts(@Param('searchString') searchString: string): Promise<PostModel[]> {
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
  async publishPost(@Param('id') id: string): Promise<PostModel> {
    return this.postService.updatePost({
      where: { id: Number(id) },
      data: { published: true },
    });
  }

  @Delete('/:id')
  async deletePost(@Param('id') id: string): Promise<PostModel> {
    return this.postService.deletePost({ id: Number(id) });
  }
}
