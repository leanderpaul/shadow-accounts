/**
 * Importing npm packages
 */

import { ErrorCode, ErrorType } from '@leanderpaul/shadow-service';

/**
 * Importing user defined packages
 */

/**
 * Defining types
 */

/**
 * Declaring the constants
 */

export class IAMErrorCode extends ErrorCode {
  /*!
   * List of all IAM related errors
   */

  /** Access denied */
  static readonly IAM001 = new IAMErrorCode('IAM001', ErrorType.UNAUTHORIZED, 'Access denied');

  /*!
   * List of all server related errors
   */

  /** Unexpected server error */
  static readonly S001 = new IAMErrorCode('S001', ErrorType.SERVER_ERROR, 'Unexpected server error');
  /** Not found */
  static readonly S002 = new IAMErrorCode('S002', ErrorType.NOT_FOUND, 'Not found');
  /** Invalid input */
  static readonly S003 = new IAMErrorCode('S003', ErrorType.VALIDATION_ERROR, 'Invalid input');
}
