import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class UserVO {
  @ApiProperty({ description: '用户ID' })
  id: number;

  @ApiProperty({ description: '用户名' })
  username: string;

  @ApiProperty({ description: '用户邮箱' })
  email: string;

  @ApiProperty({ description: '用户角色' })
  role: string;
}

export class UserListVO {
  @ApiProperty({ type: [UserVO], description: '用户列表' })
  @Type(() => UserVO)
  users: UserVO[];
}
