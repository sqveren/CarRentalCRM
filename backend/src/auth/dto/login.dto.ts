import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class LoginDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  login!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  password!: string;
}
