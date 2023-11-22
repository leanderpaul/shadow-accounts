/**
 * Importing npm packages
 */
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEmail, IsOptional, IsStrongPassword, Matches, MaxLength, MinLength } from 'class-validator';

/**
 * Importing user defined packages
 */

/**
 * Defining types
 */

/**
 * Declaring the constants
 */
const nameRegex = /^[a-zA-Z0-9 \-_.']+$/;
const nameRegexMessage = 'must contain only letters, numbers, spaces, and the following characters: -_.';

export class RegisterDto {
  @ApiProperty()
  @Transform(params => params.value.trim())
  @Matches(nameRegex, { message: nameRegexMessage })
  @MinLength(1)
  @MaxLength(32)
  firstName: string;

  @ApiProperty()
  @Transform(params => params.value.trim())
  @Matches(nameRegex, { message: nameRegexMessage })
  @MaxLength(32)
  @IsOptional()
  lastName?: string;

  @ApiProperty()
  @IsEmail()
  email: string;

  @ApiProperty()
  @IsStrongPassword({ minLength: 8, minLowercase: 1, minUppercase: 1, minNumbers: 1, minSymbols: 1 })
  password: string;
}
