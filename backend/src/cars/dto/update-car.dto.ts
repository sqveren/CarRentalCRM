import { IsIn, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

const carStatuses = ['available', 'rented', 'maintenance', 'cleaning', 'damaged'] as const;

export class UpdateCarDto {
  @IsString()
  @IsOptional()
  brand?: string;

  @IsString()
  @IsOptional()
  model?: string;

  @IsInt()
  @Min(1991)
  @Max(2100)
  @IsOptional()
  manufactureYear?: number;

  @IsInt()
  @Min(0)
  @IsOptional()
  mileage?: number;

  @IsIn(carStatuses)
  @IsOptional()
  status?: (typeof carStatuses)[number];

  @IsString()
  @IsOptional()
  imageUrl?: string;

  @IsInt()
  @IsOptional()
  categoryId?: number;
}
