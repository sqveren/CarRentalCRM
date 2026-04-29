import { IsNumber, IsOptional, IsString, MaxLength, Min } from 'class-validator';

export class UpdateServiceDto {
  @IsString()
  @IsOptional()
  @MaxLength(100)
  name?: string;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @IsOptional()
  price?: number;
}
