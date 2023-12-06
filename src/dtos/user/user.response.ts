/**
 * Importing npm packages
 */
import { ApiProperty } from '@nestjs/swagger';

/**
 * Importing user defined packages
 */
import { type ID, User } from '@app/modules/database';
import { type Gender } from '@app/modules/database/database.types';

/**
 * Defining types
 */

/**
 * Declaring the constants
 */

export class UserResponse {
  @ApiProperty({ type: 'string', description: 'Account ID' })
  aid: ID;

  @ApiProperty({ type: 'string', description: 'User ID' })
  uid: ID;

  @ApiProperty()
  firstName: string;

  @ApiProperty({ required: false })
  lastName?: string;

  @ApiProperty({ description: 'Primary email ID' })
  email: string;

  @ApiProperty({ required: false, description: 'Profile picture URL' })
  imageUrl?: string;

  @ApiProperty({ required: false, enum: User.Gender })
  gender?: Gender;

  @ApiProperty({ required: false, description: 'Date of birth in the format YYYY-MM-DD' })
  dob?: string;

  @ApiProperty({ description: 'User created datetime' })
  createdAt: Date;

  @ApiProperty({ description: 'User last updated datetime' })
  updatedAt: Date;
}
