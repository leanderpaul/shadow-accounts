/**
 * Importing npm packages
 */
import { Type } from '@nestjs/common';

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
  canActivate(): boolean;
}

/**
 * Guard
 */
export type Guard = Type<CanActivate>;
