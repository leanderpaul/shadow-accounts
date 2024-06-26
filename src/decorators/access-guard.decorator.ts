/**
 * Importing npm packages
 */
import { RoleAuthorizer } from '@leanderpaul/shadow-service';
import { type ExecutionContext, Injectable, NotFoundException, UseGuards, applyDecorators, mixin } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ApiResponse } from '@nestjs/swagger';

/**
 * Importing user defined packages
 */
import { RENDER_VIEW_METADATA } from '@app/constants';
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
  requiredRole?: IAMRoles;
  internal?: true;
  scopedServices?: string[];
}

export enum IAMRoles {
  Admin = 'IAMAdmin',
}

/**
 * Declaring the constants
 */
const notFound = new NotFoundException();
const cache: Record<string, Guard> = {};
const unauthenticatedResponse = ApiResponse({ status: 401, type: UnauthenticatedResponse, description: 'Unauthenticated' });
const unauthorizedResponse = ApiResponse({ status: 403, type: UnauthorizedResponse, description: 'Unauthorized' });

/** Initializing the IAM Roles */
const iamAdmin = RoleAuthorizer.createRole(IAMRoles.Admin);
const roleAuthorizer = new RoleAuthorizer([iamAdmin]);

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
      const isRender = this.reflector.get(RENDER_VIEW_METADATA, context.getHandler()) as boolean;
      const user = Context.getCurrentUser();
      if (!user && isRender) return this.redirect('/auth/signin');
      if (!user) throw new IAMError(IAMErrorCode.IAM003);
      if (opts.verified && user.status === User.Status.UNVERIFIED) throw new IAMError(IAMErrorCode.U003);

      if (opts.requiredRole) {
        const serviceAccount = Context.getCurrentServiceAccount();
        if (!serviceAccount) throw new IAMError(IAMErrorCode.IAM001, notFound);
        const isAuthorized = roleAuthorizer.authorize(opts.requiredRole, serviceAccount.role);
        if (!isAuthorized) throw new IAMError(IAMErrorCode.IAM001, notFound);
      }

      return true;
    }
  }

  return mixin(MixinAuthGuard);
}

function getAccessGuard(opts: AccessGuardOptions): Guard {
  const cacheKeyArr: string[] = [];
  if (opts.verified) cacheKeyArr.push('verified');
  if (opts.internal) cacheKeyArr.push('internal');
  if (opts.requiredRole) cacheKeyArr.push(opts.requiredRole);
  if (opts.scopedServices) cacheKeyArr.push(`[${opts.scopedServices.join(',')}]`);

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
