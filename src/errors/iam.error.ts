/**
 * Importing npm packages
 */
import { AppError } from '@leanderpaul/shadow-service';
import { HttpException } from '@nestjs/common';

/**
 * Importing user defined packages
 */
import { IAMErrorCode } from './iam-error-code.error';

/**
 * Defining types
 */

/**
 * Declaring the constants
 */

export class IAMError extends AppError {
  private readonly genericError?: IAMError | HttpException;

  constructor(errCode: IAMErrorCode, genericError?: IAMError | HttpException) {
    super(errCode);
    this.genericError = genericError;
    this.name = this.constructor.name;
  }

  getGenericError(): Error | undefined {
    return this.genericError;
  }

  override toString(): string {
    return `IAMError: ${this.getCode()} - ${this.getMessage()}`;
  }
}
