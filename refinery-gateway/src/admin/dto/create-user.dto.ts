import { IsEmail, IsString, MinLength, IsArray, IsOptional } from 'class-validator';

export class CreateUserDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  password: string;

  @IsString()
  name: string;

  @IsArray()
  @IsOptional()
  roles?: string[];
}

export class CreateApiKeyDto {
  @IsString()
  name: string;

  @IsString()
  userId: string;

  @IsArray()
  @IsOptional()
  scopes?: string[];

  @IsOptional()
  expiresAt?: Date;
}

export class UpdateUserDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsArray()
  @IsOptional()
  roles?: string[];

  @IsOptional()
  active?: boolean;
}
