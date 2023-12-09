/**
 * Importing npm packages
 */
import { ApiProperty } from '@nestjs/swagger';

/**
 * Importing user defined packages
 */

/**
 * Defining types
 */

/**
 * Declaring the constants
 */

export class UserEmailResponse {
  @ApiProperty()
  email: string;

  @ApiProperty()
  verified: boolean;

  @ApiProperty({ required: false })
  primary?: boolean;
}
