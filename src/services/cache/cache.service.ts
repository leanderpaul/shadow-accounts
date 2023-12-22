/**
 * Importing npm packages
 */
import { LRUCache } from '@leanderpaul/shadow-service';

/**
 * Importing user defined packages
 */
import { type MiddlewareCallback } from '@app/interfaces';

import { Context } from '../context.service';

/**
 * Defining types
 */

/**
 * Declaring the constants
 */

class CacheService {
  init(): MiddlewareCallback {
    return (_req, _res, next) => {
      const cache = new LRUCache(5);
      Context.set('cache', cache);
      next();
    };
  }
}

const globalRef = global as any;
export const Cache: CacheService = globalRef.cacheService || (globalRef.cacheService = new CacheService());
