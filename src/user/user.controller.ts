import { Body, Controller, Get, Param, Put } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserService } from './user.service';
import { UpdateUserVO } from './vo/update-user.vo';
import { UserListVO } from './vo/user-list.vo';

@ApiTags('用户管理')
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('all')
  @ApiOperation({ summary: '获取所有用户', description: '获取系统中所有用户的列表' })
  @ApiResponse({
    status: 200,
    description: '获取所有用户的列表',
    type: UserListVO,
  })
  async findAll(): Promise<UserListVO> {
    return await this.userService.users({});
  }

  @Put(':id')
  @ApiOperation({ summary: '更新用户信息', description: '更新指定用户的基本信息' })
  @ApiResponse({
    status: 200,
    description: '用户更新成功',
    type: UpdateUserVO,
  })
  async updateUser(@Param('id') id: number, @Body() userData: UpdateUserDto): Promise<UpdateUserVO> {
    return this.userService.updateUser({ where: { id }, data: userData });
  }
}
