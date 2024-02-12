import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateUserDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString({
    message: 'name should be characters',
  })
  @IsNotEmpty()
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
