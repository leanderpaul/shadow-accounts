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
import { DatabaseService, User } from '@app/modules/database';
import { type UserEmail, type UserInfo, type UserSession } from '@app/modules/database/database.types';
import { Config, Context, Logger } from '@app/services';

import { CookieService, type UserCookie } from './cookie.service';

/**
 * Defining types
 */

interface AuthUser extends UserInfo {
  emails: UserEmail[];
  sessions: UserSession[];
}

/**
 * Declaring the constants
 */
const AUTH_INITED = 'AUTH_INITED';

@Injectable()
export class AuthService {
  private readonly logger = Logger.getLogger(AuthService.name);
  private readonly userModel;

  constructor(
    databaseService: DatabaseService,
    private readonly cookieService: CookieService,
  ) {
    this.userModel = databaseService.getUserModel();
  }

  private async authenticateUser(cookieData: UserCookie): Promise<void> {
    /** Verifying the cookie data */
    const maxAge = Config.get('cookie.max-age');
    const projection = User.constructProjection({ sessions: 1 });
    const promise = this.userModel.findOneAndUpdate({ uid: cookieData.uid }, {}, { runValidators: false, projection });
    promise.setUpdate({ $pull: { sessions: { accessedAt: { $lt: moment().subtract(maxAge, 'seconds').toDate() } } } });
    const user = await promise.lean<AuthUser>();
    if (!user) return this.cookieService.clearCookies();
    const session = user.sessions.find(s => s.token === cookieData.token);
    if (!session) return this.cookieService.clearCookies();

    /** Updating the last accessed time in user seesion */
    this.userModel
      .updateOne({ uid: cookieData.uid, 'sessions.id': session.id }, { $set: { 'sessions.$.accessedAt': new Date() } })
      .catch(err => this.logger.error(err, { message: 'Failed updating last accessed time in user session' }));

    /** Setting up the request context values */
    Context.setCurrentUser(user);
    Context.setCurrentSession(session);
  }

  getRedirectUrl(): string {
    const req = Context.getCurrentRequest();
    const query = req.query as Record<string, string>;
    const redirectUrl = query.redirectUrl ?? '/';
    return redirectUrl;
  }

  async authenticate(): Promise<void> {
    if (Context.get<true>(AUTH_INITED)) return;
    else Context.set(AUTH_INITED, true);

    const cookieData = this.cookieService.getUserCookies();
    if (cookieData) return this.authenticateUser(cookieData);
  }

  generateCSRFToken(expireAt?: moment.Moment): string {
    if (!expireAt) expireAt = moment().add(1, 'hour');
    const session = Context.getCurrentSession(true);
    const md5 = crypto.createHash('md5');
    const payload = expireAt.unix() + '|' + session.token;
    return expireAt.unix() + '|' + md5.update(payload).digest('base64url');
  }

  async verifyCSRFToken(): Promise<true> {
    const { headers } = Context.getCurrentRequest();
    const token = headers['x-csrf-token'] as string | undefined;
    if (!token) throw new IAMError(IAMErrorCode.IAM002);
    const user = Context.getCurrentUser();
    if (!user) throw new IAMError(IAMErrorCode.IAM001);

    const [expireAt] = token.split('|');
    const expiryDate = moment(expireAt, 'X');
    if (expiryDate.isBefore()) throw new IAMError(IAMErrorCode.IAM002);
    const csrfToken = this.generateCSRFToken(expiryDate);
    if (token != csrfToken) throw new IAMError(IAMErrorCode.IAM002);

    return true;
  }
}
