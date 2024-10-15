import { ApiProperty } from '@nestjs/swagger';

export class UpdateUserVO {
  @ApiProperty({ description: '用户ID' })
  id: number;

  @ApiProperty({ description: '用户姓名，选填', required: false })
  name?: string;

  @ApiProperty({ description: '用户邮箱' })
  email: string;
}
