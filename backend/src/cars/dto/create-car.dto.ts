import { IsIn, IsInt, IsNotEmpty, IsOptional, IsString, Max, Min } from 'class-validator';

const carStatuses = ['available', 'rented', 'maintenance', 'cleaning', 'damaged'] as const;

export class CreateCarDto {
  @IsString()
  @IsNotEmpty()
  brand!: string;

  @IsString()
  @IsNotEmpty()
  model!: string;

  @IsInt()
  @Min(1991)
  @Max(2100)
  manufactureYear!: number;

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
  categoryId!: number;
}
