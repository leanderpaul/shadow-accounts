/**
 * Importing npm packages
 */
import crypto from 'crypto';

import { Injectable } from '@nestjs/common';
import moment from 'moment';

/**
 * Importing user defined packages
 */
import { AuthInfo } from '@app/dtos/auth';
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
  lastName?: string;
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
    const prevId = user?.sessions?.[user.sessions.length - 1]?.id ?? 0;
    const req = Context.getCurrentRequest();
    const token = crypto.randomBytes(32).toString('base64url');
    const now = new Date();
    const session: UserSession = { id: prevId + 1, token, accessedAt: now, createdAt: now };
    if (req.ip) session.ipAddr = req.ip;
    if (req.headers['user-agent']) session.userAgent = req.headers['user-agent'];
    return session;
  }

  async getAuthInfo(email: string): Promise<AuthInfo> {
    const user = await this.userService.getUser(email, ['status']);
    const authInfo: AuthInfo = { userExists: !!user, isLoginAllowed: false };
    let error: IAMError | null = null;
    if (!user) error = new IAMError(IAMErrorCode.U001);
    else if (user.status === User.Status.ACTIVE || user.status === User.Status.UNVERIFIED) authInfo.isLoginAllowed = true;
    else error = new IAMError(user.status === User.Status.INACTIVE ? IAMErrorCode.U006 : IAMErrorCode.U008);
    if (error) authInfo.error = { code: error.getCode(), message: error.getMessage() };
    return authInfo;
  }

  async registerNativeUser(newUser: ICreateUser): Promise<UserInfo> {
    const session = this.generateUserSession();
    const user = await this.userService.createUser(newUser, session);
    Context.setCurrentUser(user);
    Context.setCurrentSession(session);
    this.cookieService.setUserCookies(user.uid, session.token);
    return User.getUserInfo(user);
  }

  async loginUser(email: string, password: string): Promise<UserInfo> {
    const projection = User.constructProjection({ password: 1, sessions: 1 });
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
