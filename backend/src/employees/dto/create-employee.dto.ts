import { IsInt, IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateEmployeeDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  firstName!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  lastName!: string;

  @IsInt()
  roleId!: number;

  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  login!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  passwordHash!: string;
}
