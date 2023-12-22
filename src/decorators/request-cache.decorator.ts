/**
 * Importing npm packages
 */
import { LRUCache } from '@leanderpaul/shadow-service';

/**
 * Importing user defined packages
 */
import { Context } from '@app/services';

/**
 * Defining types
 */

type CacheOperationType = 'get' | 'set' | 'del' | 'clear';

type GetCacheKey = (...args: any[]) => string;

type Func = (...args: any[]) => Promise<any>;

/**
 * Declaring the constants
 */

export function RequestCache(op: 'clear'): MethodDecorator;
export function RequestCache(op: 'get' | 'set' | 'del', getCacheKey: GetCacheKey): MethodDecorator;
export function RequestCache(op: CacheOperationType, getCacheKey?: GetCacheKey): MethodDecorator {
  return (_target, _propertyKey, descriptor) => {
    const originalMethod = descriptor.value as Func;

    descriptor.value = async function (this: any, ...args: any[]) {
      const cache = Context.getOptional<LRUCache>('cache');
      if (!cache) return originalMethod.apply(this, args);

      if (getCacheKey === undefined) {
        const result = await originalMethod.apply(this, args);
        cache.clear();
        return result;
      }

      const cacheKey = getCacheKey.apply(this, args);
      if (op === 'get') {
        const cachedResult = await cache.get(cacheKey);
        if (cachedResult) return cachedResult;
      }

      const result = await originalMethod.apply(this, args);
      if (op === 'del') cache.remove(cacheKey);
      else cache.set(cacheKey, result);

      return result;
    } as any;

    return descriptor;
  };
}
