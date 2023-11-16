/**
 * Importing npm packages
 */
import { ApiProperty } from '@nestjs/swagger';

/**
 * Importing user defined packages
 */
import { ErrorInfo } from '@app/dtos/errors';

/**
 * Defining types
 */

/**
 * Declaring the constants
 */

export class AuthInfo {
  @ApiProperty({ description: 'Denotes whether user account exists or not' })
  userExists: boolean;

  @ApiProperty({ description: 'Denotes whether user is allowed to login or not' })
  isLoginAllowed: boolean;

  @ApiProperty({ description: 'Auth errors', required: false })
  error?: ErrorInfo;
}
