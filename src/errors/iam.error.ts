/**
 * Importing npm packages
 */
import { AppError } from '@leanderpaul/shadow-service';

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
  constructor(errCode: IAMErrorCode) {
    super(errCode);
    this.name = this.constructor.name;
  }
}
