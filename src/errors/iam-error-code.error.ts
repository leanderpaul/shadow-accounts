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
  /** User email address not verified */
  static readonly U003 = new IAMErrorCode('U003', ErrorType.CLIENT_ERROR, 'User email address not verified');
  /** Email address already verified */
  static readonly U004 = new IAMErrorCode('U004', ErrorType.CLIENT_ERROR, 'Email address already verified');
  /** Verification token invalid or expired */
  static readonly U005 = new IAMErrorCode('U005', ErrorType.CLIENT_ERROR, 'Verification token invalid or expired');
  /** User not active */
  static readonly U006 = new IAMErrorCode('U006', ErrorType.CLIENT_ERROR, 'User not active');
  /** Incorrect password */
  static readonly U007 = new IAMErrorCode('U007', ErrorType.CLIENT_ERROR, 'Incorrect password');
  /** User account closed */
  static readonly U008 = new IAMErrorCode('U008', ErrorType.CLIENT_ERROR, 'User account closed');
  /** User email address already exists */
  static readonly U009 = new IAMErrorCode('U009', ErrorType.CONFLICT, 'User email address already exists');
  /** User email address not found */
  static readonly U010 = new IAMErrorCode('U010', ErrorType.NOT_FOUND, 'User email address not found');
  /** Only verified email addresses can be set as primary */
  static readonly U011 = new IAMErrorCode('U011', ErrorType.CLIENT_ERROR, 'Only verified email addresses can be set as primary');
  /** Primary email address cannot be deleted */
  static readonly U012 = new IAMErrorCode('U012', ErrorType.CLIENT_ERROR, 'Primary email address cannot be deleted');

  /*!
   * List of all app service related errors
   */

  /** App service not found */
  static readonly AS001 = new IAMErrorCode('AS001', ErrorType.NOT_FOUND, 'App service not found');
  /** App service already exists */
  static readonly AS002 = new IAMErrorCode('AS002', ErrorType.CLIENT_ERROR, 'App service already exists');
  /** App service not active */
  static readonly AS003 = new IAMErrorCode('AS003', ErrorType.CLIENT_ERROR, 'App service not active');
  /** App service registration not allowed */
  static readonly AS004 = new IAMErrorCode('AS004', ErrorType.CLIENT_ERROR, 'App service registration not allowed');
  /** App service role not found */
  static readonly AS005 = new IAMErrorCode('AS005', ErrorType.NOT_FOUND, 'App service role not found');
  /** App service role already exists */
  static readonly AS006 = new IAMErrorCode('AS006', ErrorType.CLIENT_ERROR, 'App service role already exists');
  /** App service role invalid */
  static readonly AS007 = new IAMErrorCode('AS007', ErrorType.CLIENT_ERROR, 'App service role invalid');
}
