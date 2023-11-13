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

  /*!
   * List of all server related errors
   */
  static readonly UNKNOWN_ERROR = new IAMErrorCode('S001', ErrorType.SERVER_ERROR, 'Unexpected server error');
}
