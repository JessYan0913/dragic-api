import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class PermissionVO {
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

export class RoleVO {
  @ApiProperty()
  id: number;

  @ApiProperty()
  name: string;
}

export class UserVO {
  @ApiProperty()
  id: number;

  @ApiProperty()
  email: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  age?: number;

  @ApiProperty({ type: [PermissionVO] })
  @Type(() => PermissionVO)
  permissions: PermissionVO[];

  @ApiProperty({ type: [RoleVO] })
  @Type(() => RoleVO)
  roles: RoleVO[];
}

export class LoginVO {
  @ApiProperty()
  accessToken: string;

  @ApiProperty({ type: UserVO })
  @Type(() => UserVO)
  user: UserVO;
}
