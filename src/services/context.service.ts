/**
 * Importing npm packages
 */
import { ContextService } from '@leanderpaul/shadow-service';
import { type FastifyReply, type FastifyRequest } from 'fastify';
import lodash from 'lodash';

/**
 * Importing user defined packages
 */
import { type AppService, ServiceAccount, type User, type UserSession } from '@app/modules/database/database.types';

/**
 * Defining types
 */

export type CurrentUser = Pick<User, 'aid' | 'uid' | 'emails' | 'firstName' | 'lastName' | 'role' | 'status' | 'type'>;

export type CurrentSession = Pick<UserSession, 'id' | 'token'> & { service?: true };

/**
 * Declaring the constants
 */

class AppContextService extends ContextService<FastifyRequest, FastifyReply> {
  getCurrentUser(): CurrentUser | undefined;
  getCurrentUser(required: true): CurrentUser;
  getCurrentUser(required?: true): CurrentUser | undefined {
    return required ? this.get('CURRENT_USER', true) : this.get('CURRENT_USER');
  }

  setCurrentUser(user: CurrentUser): AppContextService {
    this.set('CURRENT_USER', user);
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

  getCurrentService(): AppService | undefined;
  getCurrentService(required: true): AppService;
  getCurrentService(required?: true): AppService | undefined {
    return required ? this.get('CURRENT_SERVICE', true) : this.get('CURRENT_SERVICE');
  }

  setCurrentService(service: AppService): AppContextService {
    this.set('CURRENT_SERVICE', service);
    return this;
  }

  getCurrentServiceAccount(): ServiceAccount | undefined;
  getCurrentServiceAccount(required: true): ServiceAccount;
  getCurrentServiceAccount(required?: true): ServiceAccount | undefined {
    return required ? this.get('CURRENT_SERVICE_ACCOUNT', true) : this.get('CURRENT_SERVICE_ACCOUNT');
  }

  setCurrentServiceAccount(account: ServiceAccount): AppContextService {
    this.set('CURRENT_SERVICE_ACCOUNT', account);
    return this;
  }
}

const globalRef = global as any;
export const Context: AppContextService = globalRef.contextService || (globalRef.contextService = new AppContextService());
