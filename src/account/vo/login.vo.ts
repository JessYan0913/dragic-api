import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class PermissionVo {
  @ApiProperty()
  id: number;

  @ApiProperty()
  name: string;

  @ApiProperty()
  resource: string;

  @ApiProperty()
  action: string;

  @ApiProperty()
  description: string;
}

export class RoleVo {
  @ApiProperty()
  id: number;

  @ApiProperty()
  name: string;
}

export class UserVo {
  @ApiProperty()
  id: number;

  @ApiProperty()
  email: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  age?: number;

  @ApiProperty({ type: [PermissionVo] })
  @Type(() => PermissionVo)
  permissions: PermissionVo[];

  @ApiProperty({ type: [RoleVo] })
  @Type(() => RoleVo)
  roles: RoleVo[];
}

export class LoginVo {
  @ApiProperty()
  accessToken: string;

  @ApiProperty({ type: UserVo })
  @Type(() => UserVo)
  user: UserVo;
}
