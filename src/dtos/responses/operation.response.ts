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

export class OperationResponse {
  @ApiProperty({ description: 'Whether the operation was successful or not' })
  success: boolean;
}
