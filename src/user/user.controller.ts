import { Body, Controller, Get, Param, Put } from '@nestjs/common';
import { ApiResponse } from '@nestjs/swagger'; // 导入ApiResponse和ApiCreatedResponse
import { SetPermissionsDto } from './dto/set-permissions.dto';
import { SetRolesDto } from './dto/set-roles.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserService } from './user.service';
import { SetPermissionsVO } from './vo/set-permissions.vo';
import { SetRolesVO } from './vo/set-roles.vo';
import { UpdateUserVO } from './vo/update-user.vo';
import { UserListVO } from './vo/user-list.vo';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('all')
  @ApiResponse({
    status: 200,
    description: '获取所有用户的列表',
    type: UserListVO, // 指定返回类型
  })
  async findAll(): Promise<UserListVO> {
    return await this.userService.users({});
  }

  @Put(':id')
  @ApiResponse({
    status: 200,
    description: '用户更新成功',
    type: UpdateUserVO, // 指定返回类型
  })
  async updateUser(@Param('id') id: number, @Body() userData: UpdateUserDto): Promise<UpdateUserVO> {
    return this.userService.updateUser({ where: { id }, data: userData });
  }

  @Put(':id/roles')
  @ApiResponse({
    status: 200,
    description: '设置用户角色成功',
    type: SetRolesVO, // 指定返回类型
  })
  async setRoles(@Param('id') id: number, @Body() setRolesDto: SetRolesDto): Promise<SetRolesVO> {
    return this.userService.setRoles(id, setRolesDto.roles);
  }

  @Put(':id/permissions')
  @ApiResponse({
    status: 200,
    description: '设置用户权限成功',
    type: SetPermissionsVO, // 指定返回类型
  })
  async setPermissions(
    @Param('id') id: number,
    @Body() setPermissionsDto: SetPermissionsDto,
  ): Promise<SetPermissionsVO> {
    return this.userService.setPermissions(id, setPermissionsDto.permissions);
  }
}
