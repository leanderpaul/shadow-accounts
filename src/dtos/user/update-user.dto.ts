/**
 * Importing npm packages
 */
import { ApiProperty, PartialType, PickType } from '@nestjs/swagger';
import { IsDateString, IsEnum, IsInt, IsOptional, IsUrl } from 'class-validator';

/**
 * Importing user defined packages
 */
import { User } from '@app/modules/database';

import { RegisterDto } from '../auth';
import { MaxDateString } from '../validators';

/**
 * Defining types
 */

/**
 * Declaring the constants
 */

export class UpdateUserDto extends PickType(PartialType(RegisterDto), ['firstName', 'lastName'] as const) {
  @ApiProperty({ required: false })
  @IsUrl()
  @IsOptional()
  imageUrl?: string;

  @ApiProperty({ required: false })
  @IsInt()
  @IsEnum(User.Gender)
  @IsOptional()
  gender?: number;

  @ApiProperty({ required: false })
  @MaxDateString(() => new Date())
  @IsDateString()
  @IsOptional()
  dob?: string;
}
