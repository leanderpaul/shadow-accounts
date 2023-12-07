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
  /** Invalid CSRF token */
  static readonly IAM002 = new IAMErrorCode('IAM002', ErrorType.UNAUTHORIZED, 'Invalid CSRF token');
  /** Unauthenticated */
  static readonly IAM003 = new IAMErrorCode('IAM003', ErrorType.UNAUTHENTICATED, 'Unauthenticated');

  /*!
   * List of all account related errors
   */

  /** Account not found */
  static readonly A001 = new IAMErrorCode('A001', ErrorType.NOT_FOUND, 'Account not found');

  /*!
   * List of all user related errors
   */

  /** User not found */
  static readonly U001 = new IAMErrorCode('U001', ErrorType.NOT_FOUND, 'User not found');
  /** User already exists */
  static readonly U002 = new IAMErrorCode('U002', ErrorType.CLIENT_ERROR, 'User already exists');
  /** User not verified */
  static readonly U003 = new IAMErrorCode('U003', ErrorType.CLIENT_ERROR, 'User email address not verified');
  /** User already verified */
  static readonly U004 = new IAMErrorCode('U004', ErrorType.CLIENT_ERROR, 'Email address already verified');
  /** Verification token invalid or expired */
  static readonly U005 = new IAMErrorCode('U005', ErrorType.CLIENT_ERROR, 'Verification token invalid or expired');
  /** User not active */
  static readonly U006 = new IAMErrorCode('U006', ErrorType.CLIENT_ERROR, 'User not active');
  /** Incorrect password */
  static readonly U007 = new IAMErrorCode('U007', ErrorType.CLIENT_ERROR, 'Incorrect password');
  /** User account closed */
  static readonly U008 = new IAMErrorCode('U008', ErrorType.CLIENT_ERROR, 'User account closed');
}
