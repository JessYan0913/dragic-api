import { Injectable } from '@nestjs/common';
import { PrismaService } from '@pictode-api/prisma';
import { Post, Prisma, User } from '@prisma/client';
import { plainToClass } from 'class-transformer';
import { CreatePostVO } from './vo/create-post.vo';
import { PostDetailVO } from './vo/post-detail.vo';

@Injectable()
export class PostService {
  constructor(private readonly prisma: PrismaService) {}

  async post(postWhereUniqueInput: Prisma.PostWhereUniqueInput): Promise<PostDetailVO | null> {
    const post = await this.prisma.post.findUnique({
      where: postWhereUniqueInput,
    });
    return post ? plainToClass(PostDetailVO, post) : null;
  }

  async posts(params: {
    skip?: number;
    take?: number;
    cursor?: Prisma.PostWhereUniqueInput;
    where?: Prisma.PostWhereInput;
    orderBy?: Prisma.PostOrderByWithRelationInput;
  }): Promise<PostDetailVO[]> {
    const { skip, take, cursor, where, orderBy } = params;
    const posts = await this.prisma.post.findMany({
      skip,
      take,
      cursor,
      where,
      orderBy,
    });
    return posts.map(post => plainToClass(PostDetailVO, post));
  }

  async createPost(user: User, data: Prisma.PostCreateInput): Promise<CreatePostVO> {
    const post = await this.prisma.post.create({
      data: {
        ...data,
        author: {
          connect: {
            id: user.id,
          },
        },
      },
    });
    return plainToClass(CreatePostVO, post);
  }

  async updatePost(params: { where: Prisma.PostWhereUniqueInput; data: Prisma.PostUpdateInput }): Promise<PostDetailVO> {
    const { data, where } = params;
    const post = await this.prisma.post.update({
      data,
      where,
    });
    return plainToClass(PostDetailVO, post);
  }

  async deletePost(where: Prisma.PostWhereUniqueInput): Promise<PostDetailVO> {
    const post = await this.prisma.post.delete({
      where,
    });
    return plainToClass(PostDetailVO, post);
  }
}
