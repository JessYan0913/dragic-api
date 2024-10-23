import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';

export class PermissionVO {
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

export class RoleVO {
  @ApiProperty()
  @Expose()
  id: number;

  @ApiProperty()
  @Expose()
  name: string;
}

export class UserVO {
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

  @ApiProperty({ type: [PermissionVO] })
  @Type(() => PermissionVO)
  @Expose()
  permissions: PermissionVO[];

  @ApiProperty({ type: [RoleVO] })
  @Type(() => RoleVO)
  @Expose()
  roles: RoleVO[];
}

export class LoginVO {
  @ApiProperty()
  @Expose()
  accessToken: string;

  @ApiProperty({ type: UserVO })
  @Type(() => UserVO)
  @Expose()
  user: UserVO;
}
