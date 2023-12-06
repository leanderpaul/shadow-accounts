/**
 * Importing npm packages
 */
import { ApiProperty, PartialType, PickType } from '@nestjs/swagger';
import { IsDateString, IsEnum, IsOptional, IsUrl, MaxDate } from 'class-validator';

/**
 * Importing user defined packages
 */
import { User } from '@app/modules/database';

import { RegisterDto } from '../auth';

/**
 * Defining types
 */

/**
 * Declaring the constants
 */

export class UpdateUserDto extends PickType(PartialType(RegisterDto), ['firstName', 'lastName'] as const) {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsUrl()
  imageUrl?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsEnum(User.Gender)
  gender?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString()
  @MaxDate(new Date())
  dob?: string;
}
