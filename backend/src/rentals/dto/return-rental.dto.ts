import { IsIn, IsInt, IsNumber, IsOptional, IsString, Min } from 'class-validator';

const returnCarStatuses = ['available', 'maintenance', 'cleaning', 'damaged'] as const;

export class ReturnRentalDto {
  @IsInt()
  @Min(0)
  endMileage!: number;

  @IsIn(returnCarStatuses)
  carStatus!: (typeof returnCarStatuses)[number];

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01)
  @IsOptional()
  paymentAmount?: number;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01)
  @IsOptional()
  fineAmount?: number;

  @IsString()
  @IsOptional()
  fineDescription?: string;
}
