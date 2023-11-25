/**
 * Importing npm packages
 */
import { UseGuards, mixin } from '@nestjs/common';

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
    redirect(url: string): boolean {
      const req = Context.getCurrentRequest();
      const res = Context.getCurrentResponse();
      const query = new URLSearchParams(req.query as Record<string, string>);
      query.set('redirectUrl', encodeURIComponent(req.url));
      res.redirect(`${url}?${query.toString()}`);
      return false;
    }

    canActivate(): boolean {
      const user = Context.getCurrentUser();
      if (!user) return this.redirect('/auth/signin');
      if (requiredAuth === AuthType.VERIFIED && !user.verified) throw new IAMError(IAMErrorCode.U003);
      return true;
    }
  }

  return mixin(MixinAuthGuard);
}

export function AuthGuard(requiredAuth: AuthType): Guard {
  const cachedResult = cache[requiredAuth];
  if (cachedResult) return cachedResult;
  const result = createAuthGuard(requiredAuth);
  cache[requiredAuth] = result;
  return result;
}

export const UseAuthGuard = (authType: AuthType = AuthType.VERIFIED): MethodDecorator & ClassDecorator => UseGuards(AuthGuard(authType));
