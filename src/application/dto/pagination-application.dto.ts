import { IsNumber, IsOptional, Min } from 'class-validator';

export class PaginationApplicationDto {
  @IsOptional()
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @IsNumber()
  @Min(1)
  pageSize?: number = 10;
}
