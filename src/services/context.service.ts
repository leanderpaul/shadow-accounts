/**
 * Importing npm packages
 */
import { ContextService } from '@leanderpaul/shadow-service';
import { type FastifyReply, type FastifyRequest } from 'fastify';

/**
 * Importing user defined packages
 */
import { type User, type UserSession } from '@app/modules/database/database.types';

/**
 * Defining types
 */

export type CurrentUser = Pick<User, 'aid' | 'uid' | 'firstName' | 'lastName' | 'role' | 'status' | 'type'>;

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

  setCurrentUser(user: CurrentUser): AppContextService;
  setCurrentUser(user: CurrentUser): AppContextService;
  setCurrentUser(user: CurrentUser | CurrentUser): AppContextService {
    this.set('CURRENT_USER', user);
    return this;
  }

  getCurrentSession(): CurrentSession | undefined;
  getCurrentSession(required: true): CurrentSession;
  getCurrentSession(required?: true): CurrentSession | undefined {
    return required ? this.get('CURRENT_SESSION', true) : this.get('CURRENT_SESSION');
  }

  setCurrentSession(session: CurrentSession): AppContextService {
    this.set('CURRENT_SESSION', session);
    return this;
  }
}

const globalRef = global as any;
export const Context: AppContextService = globalRef.contextService || (globalRef.contextService = new AppContextService());
