import { IsNumber, IsOptional, IsString, MaxLength, Min } from 'class-validator';

export class UpdateCarCategoryDto {
  @IsString()
  @IsOptional()
  @MaxLength(50)
  name?: string;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01)
  @IsOptional()
  pricePerDay?: number;
}
