import { IsArray, IsDateString, IsInt, IsOptional, IsString, Min } from 'class-validator';

export class CreateRentalDto {
  @IsInt()
  clientId!: number;

  @IsInt()
  carId!: number;

  @IsInt()
  employeeId!: number;

  @IsDateString()
  startDate!: string;

  @IsDateString()
  endDate!: string;

  @IsInt()
  @Min(0)
  @IsOptional()
  startMileage?: number;

  @IsInt()
  @Min(0)
  @IsOptional()
  endMileage?: number;

  @IsString()
  @IsOptional()
  status?: string;

  @IsArray()
  @IsInt({ each: true })
  @IsOptional()
  serviceIds?: number[];
}
