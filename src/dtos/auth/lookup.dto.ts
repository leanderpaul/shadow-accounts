/**
 * Importing npm packages
 */
import { ApiProperty } from '@nestjs/swagger';
import { IsEmail } from 'class-validator';

/**
 * Importing user defined packages
 */

/**
 * Defining types
 */

/**
 * Declaring the constants
 */

export class LookUpDto {
  @IsEmail()
  @ApiProperty()
  email: string;
}
