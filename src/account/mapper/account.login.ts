import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';

export class PermissionVo {
  @ApiProperty()
  @Expose()
  id: number;

  @ApiProperty()
  @Expose()
  name: string;

  @ApiProperty()
  @Expose()
  resource: string;

  @ApiProperty()
  @Expose()
  action: string;

  @ApiProperty()
  @Expose()
  description: string;
}

export class RoleVo {
  @ApiProperty()
  @Expose()
  id: number;

  @ApiProperty()
  @Expose()
  name: string;
}

export class UserVo {
  @ApiProperty()
  @Expose()
  id: number;

  @ApiProperty()
  @Expose()
  email: string;

  @ApiProperty()
  @Expose()
  name: string;

  @ApiProperty()
  @Expose()
  age?: number;

  @ApiProperty()
  @Expose()
  @Type(() => PermissionVo)
  permissions: PermissionVo[];

  @ApiProperty()
  @Expose()
  @Type(() => RoleVo)
  roles: RoleVo[];
}

export class LoginVo {
  @ApiProperty()
  @Expose()
  accessToken: string;

  @ApiProperty()
  @Expose()
  @Type(() => UserVo)
  user: UserVo;
}
