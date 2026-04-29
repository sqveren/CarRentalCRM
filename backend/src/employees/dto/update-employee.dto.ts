import { IsInt, IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateEmployeeDto {
  @IsString()
  @IsOptional()
  @MaxLength(50)
  firstName?: string;

  @IsString()
  @IsOptional()
  @MaxLength(50)
  lastName?: string;

  @IsInt()
  @IsOptional()
  roleId?: number;

  @IsString()
  @IsOptional()
  @MaxLength(50)
  login?: string;

  @IsString()
  @IsOptional()
  @MaxLength(255)
  passwordHash?: string;
}
