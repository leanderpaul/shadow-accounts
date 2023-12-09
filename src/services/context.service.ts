/**
 * Importing npm packages
 */
import { ContextService, NeverError } from '@leanderpaul/shadow-service';
import { type FastifyReply, type FastifyRequest } from 'fastify';
import lodash from 'lodash';

/**
 * Importing user defined packages
 */
import { type User, type UserSession } from '@app/modules/database/database.types';

/**
 * Defining types
 */

export interface CurrentUser extends Pick<User, 'aid' | 'uid' | 'firstName' | 'lastName' | 'role' | 'status' | 'type'> {
  verified: boolean;
  primaryEmail: string;
}

export type CurrentSession = Pick<UserSession, 'id' | 'token'>;

/**
 * Declaring the constants
 */

class AppContextService extends ContextService<FastifyRequest, FastifyReply> {
  getCurrentUser(): CurrentUser | undefined;
  getCurrentUser(required: true): CurrentUser;
  getCurrentUser(required?: true): CurrentUser | undefined {
    return required ? this.get('CURRENT_USER', true) : this.get('CURRENT_USER');
  }

  setCurrentUser(user: Pick<User, 'aid' | 'uid' | 'emails' | 'firstName' | 'lastName' | 'role' | 'status' | 'type'>): AppContextService;
  setCurrentUser(user: CurrentUser): AppContextService;
  setCurrentUser(user: CurrentUser | Pick<User, 'aid' | 'uid' | 'emails' | 'firstName' | 'lastName' | 'role' | 'status' | 'type'>): AppContextService {
    if ('emails' in user) {
      const primaryEmail = user.emails.find(e => e.primary);
      if (!primaryEmail) throw new NeverError('Primary email not found');
      user = { ...user, verified: primaryEmail.verified, primaryEmail: primaryEmail.email };
    }
    const userObj = lodash.pick(user, ['aid', 'uid', 'firstName', 'lastName', 'role', 'status', 'type', 'verified', 'primaryEmail']);
    this.set('CURRENT_USER', userObj);
    return this;
  }

  getCurrentSession(): CurrentSession | undefined;
  getCurrentSession(required: true): CurrentSession;
  getCurrentSession(required?: true): CurrentSession | undefined {
    return required ? this.get('CURRENT_SESSION', true) : this.get('CURRENT_SESSION');
  }

  setCurrentSession(session: CurrentSession): AppContextService {
    const sessionObj = lodash.pick(session, ['id', 'token']);
    this.set('CURRENT_SESSION', sessionObj);
    return this;
  }
}

const globalRef = global as any;
export const Context: AppContextService = globalRef.contextService || (globalRef.contextService = new AppContextService());
