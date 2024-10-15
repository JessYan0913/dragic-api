import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class RegistryVo {
  @ApiProperty()
  @Expose()
  id: number;

  @ApiProperty()
  @Expose()
  name: string;

  @ApiProperty()
  @Expose()
  email: string;
}
