/**
 * Importing npm packages
 */
import crypto from 'crypto';

import { Injectable } from '@nestjs/common';
import moment from 'moment';

/**
 * Importing user defined packages
 */
import { IAMError, IAMErrorCode } from '@app/errors';
import { DatabaseService, type ID, User, UserVariant } from '@app/modules/database';
import { type UserInfo, type UserSession } from '@app/modules/database/database.types';
import { UserService } from '@app/modules/user';
import { Config, Context } from '@app/services';

import { CookieService } from './cookie.service';

/**
 * Defining types
 */

export interface ICreateUser {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

/**
 * Declaring the constants
 */

@Injectable()
export class UserAuthService {
  private readonly userModel;
  private readonly nativeUserModel;

  constructor(
    databaseService: DatabaseService,
    private readonly userService: UserService,
    private readonly cookieService: CookieService,
  ) {
    this.userModel = databaseService.getUserModel();
    this.nativeUserModel = databaseService.getUserModel(UserVariant.NATIVE);
  }

  private generateUserSession(user?: Pick<User, 'sessions'>): UserSession {
    const prevId = user?.sessions[user.sessions.length - 1]?.id ?? 0;
    const req = Context.getCurrentRequest();
    const token = crypto.randomBytes(32).toString('base64url');
    return { id: prevId + 1, token, accessedAt: new Date(), ipAddr: req.ip, userAgent: req.headers['user-agent'] };
  }

  async registerNativeUser(newUser: ICreateUser): Promise<UserInfo> {
    const session = this.generateUserSession();
    const user = await this.userService.createUser(newUser, session);
    Context.setCurrentUser(user);
    Context.setCurrentSession(session);
    this.cookieService.setUserCookies(user.uid, session.token);
    return user;
  }

  async loginUser(email: string, password: string): Promise<UserInfo> {
    const projection = User.constructProjection({ password: 1 });
    const user = await this.userService.getNativeUser(email, projection);
    if (!user) throw new IAMError(IAMErrorCode.U001);
    const isValidPassword = await Bun.password.verify(password, user.password);
    if (!isValidPassword) throw new IAMError(IAMErrorCode.U007);

    const session = this.generateUserSession(user);
    const maxAge = Config.get('cookie.max-age');
    const expireAt = moment().subtract(maxAge, 'seconds').toDate();
    const validSessions = user.sessions.filter(s => s.accessedAt > expireAt);
    await this.userModel.updateOne({ uid: user.uid }, { $set: { sessions: [...validSessions, session] } });

    Context.setCurrentUser(user);
    Context.setCurrentSession(session);
    this.cookieService.setUserCookies(user.uid, session.token);
    return User.getUserInfo(user);
  }

  /** @TODO */
  // async sendEmailVerificationMail(email?: string): Promise<void> {}

  /** @TODO */
  // async sendResetPasswordMail(email: string): Promise<void> {}

  /** @TODO */
  // async resetPassword(code: string, newPassword: string): Promise<boolean> {}

  async logout(uid: ID, sessionId: number): Promise<void> {
    const updateSession = sessionId === -1 ? { $set: { sessions: [] } } : { $pull: { sessions: { id: sessionId } } };
    await this.userModel.updateOne({ _id: uid }, updateSession);
    const currentSession = Context.getCurrentSession(true);
    if (sessionId === -1 || currentSession.id === sessionId) this.cookieService.clearCookies();
  }
}
