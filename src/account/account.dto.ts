import { ApiProperty } from '@nestjs/swagger';
import { User } from '@prisma/client';
import { IsEmail, IsNotEmpty } from 'class-validator';

export class RegistryAccountDTO {
  @ApiProperty()
  @IsNotEmpty()
  name: string;

  @ApiProperty()
  @IsEmail()
  email: string;

  @ApiProperty()
  @IsNotEmpty()
  password: string;
}

export type RegistryRes = Omit<User, 'password'>;
