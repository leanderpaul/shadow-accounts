/**
 * Importing npm packages
 */
import { ApiProperty } from '@nestjs/swagger';

/**
 * Importing user defined packages
 */
import { IAMErrorCode } from '@app/errors';

/**
 * Defining types
 */

/**
 * Declaring the constants
 */

export class UnauthenticatedResponse {
  @ApiProperty()
  rid: string;

  @ApiProperty({ enum: [IAMErrorCode.IAM003.getCode()] })
  code = IAMErrorCode.IAM003.getCode();

  @ApiProperty({ enum: [IAMErrorCode.IAM003.getType()] })
  type = IAMErrorCode.IAM003.getType();

  @ApiProperty({ enum: [IAMErrorCode.IAM003.getMessage()] })
  message = IAMErrorCode.IAM003.getMessage();
}
