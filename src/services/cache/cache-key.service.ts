/**
 * Importing npm packages
 */

/**
 * Importing user defined packages
 */
import { type ID } from '@app/modules/database';

/**
 * Defining types
 */

/**
 * Declaring the constants
 */

class CacheKeyService {
  getUserEmailListKey(uid: ID): string {
    return `uel:${uid.toString()}`;
  }
}

const globalRef = global as any;
export const CacheKey: CacheKeyService = globalRef.cacheKeyService || (globalRef.cacheKeyService = new CacheKeyService());
