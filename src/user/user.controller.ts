import { Body, Controller, Get, Param, Put } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { SetPermissionsDto } from './dto/set-permissions.dto';
import { SetRolesDto } from './dto/set-roles.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserService } from './user.service';
import { SetPermissionsVO } from './vo/set-permissions.vo';
import { SetRolesVO } from './vo/set-roles.vo';
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

  @Put(':id/roles')
  @ApiOperation({ summary: '设置用户角色', description: '为指定用户分配角色' })
  @ApiResponse({
    status: 200,
    description: '设置用户角色成功',
    type: SetRolesVO,
  })
  async setRoles(@Param('id') id: number, @Body() setRolesDto: SetRolesDto): Promise<SetRolesVO> {
    return this.userService.setRoles(id, setRolesDto.roles);
  }

  @Put(':id/permissions')
  @ApiOperation({ summary: '设置用户权限', description: '为指定用户分配权限' })
  @ApiResponse({
    status: 200,
    description: '设置用户权限成功',
    type: SetPermissionsVO,
  })
  async setPermissions(
    @Param('id') id: number,
    @Body() setPermissionsDto: SetPermissionsDto,
  ): Promise<SetPermissionsVO> {
    return this.userService.setPermissions(id, setPermissionsDto.permissions);
  }
}
