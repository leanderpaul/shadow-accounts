/**
 * Importing npm packages
 */
import { ApiProperty } from '@nestjs/swagger';

import { IAMErrorCode } from '@app/errors';

/**
 * Importing user defined packages
 */

/**
 * Defining types
 */

/**
 * Declaring the constants
 */

class ValidationErroFieldResponse {
  @ApiProperty()
  field: string;

  @ApiProperty()
  msg: string;
}

export class ValidationErrorResponse {
  @ApiProperty()
  rid: string;

  @ApiProperty({ enum: [IAMErrorCode.S003.getCode()] })
  code: string;

  @ApiProperty({ enum: [IAMErrorCode.S003.getType()] })
  type: string;

  @ApiProperty({ enum: ['Validation failed'] })
  message: string;

  @ApiProperty()
  fields: ValidationErroFieldResponse[];
}
