import { OmitType } from '@nestjs/mapped-types';
import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { IsEmail, IsNotEmpty } from 'class-validator';

export class RegistryAccountDTO {
  @ApiProperty()
  @IsNotEmpty()
  @Expose()
  name: string;

  @ApiProperty()
  @IsEmail()
  @Expose()
  email: string;

  @ApiProperty()
  @IsNotEmpty()
  password: string;
}

export class RegistryAccountVo extends OmitType(RegistryAccountDTO, ['password'] as const) {
  @Expose()
  id: number;
}
