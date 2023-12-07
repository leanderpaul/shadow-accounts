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

export class UnauthorizedResponse {
  @ApiProperty()
  rid: string;

  @ApiProperty({ enum: [IAMErrorCode.IAM001.getCode()] })
  code = IAMErrorCode.IAM001.getCode();

  @ApiProperty({ enum: [IAMErrorCode.IAM001.getType()] })
  type = IAMErrorCode.IAM001.getType();

  @ApiProperty({ enum: [IAMErrorCode.IAM001.getMessage()] })
  message = IAMErrorCode.IAM001.getMessage();
}
