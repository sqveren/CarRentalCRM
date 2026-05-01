import { IsIn, IsNotEmpty, IsString, MaxLength } from 'class-validator';

const allowedSelfRegisterRoles = ['admin', 'manager', 'operator'] as const;

export class RegisterDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  firstName!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  lastName!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  login!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  password!: string;

  @IsIn(allowedSelfRegisterRoles)
  role!: (typeof allowedSelfRegisterRoles)[number];
}
