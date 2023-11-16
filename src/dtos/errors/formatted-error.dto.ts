/**
 * Importing npm packages
 */
import { ErrorType } from '@leanderpaul/shadow-service';
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
export class FieldError {
  @ApiProperty({ description: 'Field name' })
  field: string;

  @ApiProperty({ description: 'Error message' })
  msg: string;
}

export class FormattedError {
  @ApiProperty({ description: 'Request ID' })
  rid: string;

  @ApiProperty({ description: 'Error code' })
  code: string;

  @ApiProperty({ description: 'Error type', enum: ErrorType })
  type: string;

  @ApiProperty({ description: 'Error message' })
  message: string;

  @ApiProperty({ description: 'Error fields' })
  fields?: FieldError[];
}
