import { IsDateString, IsInt, IsNumber, IsOptional, Min } from 'class-validator';

export class CreatePaymentDto {
  @IsInt()
  rentalId!: number;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01)
  amount!: number;

  @IsDateString()
  @IsOptional()
  paymentDate?: string;
}
