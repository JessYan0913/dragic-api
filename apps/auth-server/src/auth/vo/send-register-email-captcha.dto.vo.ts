import { ApiProperty } from '@nestjs/swagger';

export class SendRegisterEmailCaptchaVO {
  @ApiProperty({
    description: '验证码唯一标识',
    example: 'abc123def456',
    required: true,
  })
  id: string;
}
