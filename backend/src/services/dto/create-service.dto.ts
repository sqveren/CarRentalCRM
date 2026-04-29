import { IsNotEmpty, IsNumber, IsString, MaxLength, Min } from 'class-validator';

export class CreateServiceDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name!: string;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  price!: number;
}
