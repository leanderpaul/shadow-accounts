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
import { User } from '@app/modules/database';
import { Context } from '@app/services';

/**
 * Defining types
 */

export interface AccessGuardOptions {
  verified?: boolean;
}

/**
 * Declaring the constants
 */
const cache: Record<string, Guard> = {};
const unauthenticatedResponse = ApiResponse({ status: 401, type: UnauthenticatedResponse, description: 'Unauthenticated' });
const unauthorizedResponse = ApiResponse({ status: 403, type: UnauthorizedResponse, description: 'Unauthorized' });

function createAccessGuard(opts: AccessGuardOptions): Guard {
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
      if (opts.verified && user.status === User.Status.UNVERIFIED) throw new IAMError(IAMErrorCode.U003);
      return true;
    }
  }

  return mixin(MixinAuthGuard);
}

function getAccessGuard(opts: AccessGuardOptions): Guard {
  const cacheKeyArr: string[] = [];
  if (opts.verified) cacheKeyArr.push('verified');

  const cacheKey = cacheKeyArr.join('-');
  const cachedGuard = cache[cacheKey];
  if (cachedGuard) return cachedGuard;

  const Guard = createAccessGuard(opts);
  cache[cacheKey] = Guard;
  return Guard;
}

export function AccessGuard(opts: AccessGuardOptions = {}): MethodDecorator & ClassDecorator {
  const Guard = getAccessGuard(opts);
  const decorators = [UseGuards(Guard), unauthenticatedResponse];
  if (opts.verified) decorators.push(unauthorizedResponse);
  return applyDecorators(...decorators);
}
