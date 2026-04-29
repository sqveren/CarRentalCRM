import { IsNotEmpty, IsNumber, IsString, MaxLength, Min } from 'class-validator';

export class CreateCarCategoryDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  name!: string;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01)
  pricePerDay!: number;
}
