import { IsInt, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class CreateFineDto {
  @IsInt()
  rentalId!: number;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01)
  amount!: number;
}
