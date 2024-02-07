import { IsEmail, IsOptional, IsString } from 'class-validator';

export class CreateUserDto {
  @IsEmail()
  email: string;

  @IsString()
  name: string;

  @IsString()
  password: string;

  @IsOptional()
  avatar: File;
}

export class LogInUserDto {
  @IsEmail()
  email: string;

  @IsString()
  password: string;
}
