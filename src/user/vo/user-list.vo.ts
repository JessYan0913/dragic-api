import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class UserVO {
  @ApiProperty()
  id: number;

  @ApiProperty()
  username: string;

  @ApiProperty()
  email: string;

  @ApiProperty()
  role: string;
}

export class UserListVO {
  @ApiProperty({ type: [UserVO] })
  @Type(() => UserVO)
  users: UserVO[];
}
