/**
 * Importing npm packages
 */
import { type ExecutionContext, Injectable, UseGuards, applyDecorators, mixin } from '@nestjs/common';
import { RENDER_METADATA } from '@nestjs/common/constants';
import { Reflector } from '@nestjs/core';
import { ApiResponse } from '@nestjs/swagger';

/**
 * Importing user defined packages
 */
import { UnauthenticatedResponse, UnauthorizedResponse } from '@app/dtos/responses';
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
const unauthenticatedResponse = ApiResponse({ status: 401, type: UnauthenticatedResponse, description: 'Unauthenticated' });
const unauthorizedResponse = ApiResponse({ status: 403, type: UnauthorizedResponse, description: 'Unauthorized' });

function createAuthGuard(requiredAuth: AuthType): Guard {
  @Injectable()
  class MixinAuthGuard implements CanActivate {
    constructor(private readonly reflector: Reflector) {}

    redirect(url: string): boolean {
      const req = Context.getCurrentRequest();
      const res = Context.getCurrentResponse();
      const query = new URLSearchParams(req.query as Record<string, string>);
      query.set('redirectUrl', req.url);
      res.redirect(`${url}?${query.toString()}`);
      return false;
    }

    canActivate(context: ExecutionContext): boolean {
      const isRender = this.reflector.get(RENDER_METADATA, context.getHandler()) !== undefined;
      const user = Context.getCurrentUser();
      if (!user && isRender) return this.redirect('/auth/signin');
      if (!user) throw new IAMError(IAMErrorCode.IAM003);
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

export function UseAuthGuard(authType: AuthType = AuthType.VERIFIED): MethodDecorator & ClassDecorator {
  const decorators = [UseGuards(AuthGuard(authType)), unauthenticatedResponse];
  if (authType === AuthType.VERIFIED) decorators.push(unauthorizedResponse);
  return applyDecorators(...decorators);
}
