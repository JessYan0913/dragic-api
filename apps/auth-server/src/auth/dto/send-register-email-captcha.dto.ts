import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty } from 'class-validator';

export class SendRegisterEmailCaptchaDTO {
  @ApiProperty({
    description: '用户邮箱地址',
    example: 'user@example.com',
    format: 'email',
    required: true,
  })
  @IsNotEmpty()
  @IsEmail()
  email: string;
}
