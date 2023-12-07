/**
 * Importing npm packages
 */
import { ExecutionContext, Type } from '@nestjs/common';

/**
 * Importing user defined packages
 */

/**
 * Defining types
 */

/**
 * Declaring the constants
 */

export interface CanActivate {
  canActivate(context: ExecutionContext): boolean;
}

/**
 * Guard
 */
export type Guard = Type<CanActivate>;
