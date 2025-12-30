import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';

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