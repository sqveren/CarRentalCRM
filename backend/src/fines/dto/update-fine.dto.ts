import { IsInt, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class UpdateFineDto {
  @IsInt()
  @IsOptional()
  rentalId?: number;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01)
  @IsOptional()
  amount?: number;
}
