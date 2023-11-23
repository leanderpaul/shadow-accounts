/**
 * Importing npm packages
 */
import { mixin } from '@nestjs/common';

/**
 * Importing user defined packages
 */
import { IAMError, IAMErrorCode } from '@app/errors';
import { type CanActivate, type Guard } from '@app/interfaces';
import { Context } from '@app/services';

/**
 * Defining types
 */

export enum AuthType {
  VERIFIED,
  AUTHENTICATED,
}

/**
 * Declaring the constants
 */
const cache: Partial<Record<AuthType, Guard>> = {};

function createAuthGuard(requiredAuth: AuthType): Guard {
  class MixinAuthGuard implements CanActivate {
    canActivate(): boolean {
      const user = Context.getCurrentUser();
      if (!user) throw new IAMError(IAMErrorCode.U003);
      if (requiredAuth === AuthType.VERIFIED && !user.verified) throw new IAMError(IAMErrorCode.U003);
      return true;
    }
  }

  return mixin(MixinAuthGuard);
}

export function AuthGuard(requiredAuth: AuthType = AuthType.VERIFIED): Guard {
  const cachedResult = cache[requiredAuth];
  if (cachedResult) return cachedResult;
  const result = createAuthGuard(requiredAuth);
  cache[requiredAuth] = result;
  return result;
}
