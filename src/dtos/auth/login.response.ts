/**
 * Importing npm packages
 */
import { ApiProperty } from '@nestjs/swagger';

/**
 * Importing user defined packages
 */
import { OperationResponse } from '../responses';

/**
 * Defining types
 */

/**
 * Declaring the constants
 */

export class LoginResponse extends OperationResponse {
  @ApiProperty()
  redirectUrl: string;
}
