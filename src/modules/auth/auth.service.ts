/**
 * Importing npm packages
 */
import crypto from 'crypto';

import { Injectable } from '@nestjs/common';
import moment from 'moment';

/**
 * Importing user defined packages
 */
import { ACCOUNTS_SERVICE } from '@app/constants';
import { IAMError, IAMErrorCode } from '@app/errors';
import { DatabaseService, User } from '@app/modules/database';
import { type UserEmail, type UserInfo, type UserSession } from '@app/modules/database/database.types';
import { AppServiceService } from '@app/modules/system';
import { Config, Context, Logger } from '@app/services';

import { CookieService, type UserCookie } from './cookie.service';

/**
 * Defining types
 */

interface AuthUser extends UserInfo {
  emails: UserEmail[];
  sessions: UserSession[];
}

interface ServiceAuth {
  service: string;
  token: string;
}

/**
 * Declaring the constants
 */
const AUTH_INITED = 'AUTH_INITED';

@Injectable()
export class AuthService {
  private readonly logger = Logger.getLogger(AuthService.name);
  private readonly userModel;
  private readonly serviceAccountModel;

  constructor(
    databaseService: DatabaseService,
    private readonly cookieService: CookieService,
    private readonly appServiceService: AppServiceService,
  ) {
    this.userModel = databaseService.getUserModel();
    this.serviceAccountModel = databaseService.getServiceAccountModel();
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

    /** Setting the service account */
    const service = Context.getCurrentService(true);
    const serviceAccount = await this.serviceAccountModel.findOne({ uid: user.uid, service: service.name }).lean();
    if (serviceAccount) Context.setCurrentServiceAccount(serviceAccount);

    /** Updating the last accessed time in user seesion */
    this.userModel
      .updateOne({ uid: cookieData.uid, 'sessions.id': session.id }, { $set: { 'sessions.$.accessedAt': new Date() } })
      .catch(err => this.logger.error(err, { message: 'Failed updating last accessed time in user session' }));

    /** Setting up the request context values */
    Context.setCurrentUser(user);
    Context.setCurrentSession(session);
    this.logger.debug('User authenticated', { user: user.uid, service: service.name });
  }

  private getServiceAuth(): ServiceAuth | null {
    const request = Context.getCurrentRequest();
    const serviceHeader = request.headers['x-service'] as string | undefined;
    if (!serviceHeader) return null;
    const [serviceName, serviceToken] = serviceHeader.split('|') as string[];
    if (!serviceName || !serviceToken) return null;

    return { service: serviceName, token: serviceToken };
  }

  private async authenticateService(serviceAuth: ServiceAuth): Promise<void> {
    const service = this.appServiceService.getService(serviceAuth.service);
    if (!service || !service.active) return;
    const isValid = await Bun.password.verify(service.accessToken, serviceAuth.token);
    if (!isValid) return;

    /** Setting up the request context values */
    Context.setCurrentService(service);
    Context.setCurrentSession({ id: 1, token: serviceAuth.token, service: true });
    this.logger.debug('Service authenticated', { service: service.name });
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
    this.logger.debug('initing the user auth');

    /** Initializing the accounts service context */
    const service = this.appServiceService.getService(ACCOUNTS_SERVICE);
    if (!service || !service.active) return;
    Context.setCurrentService(service);

    /** Authenticating the user */
    const cookieData = this.cookieService.getUserCookies();
    if (cookieData) return this.authenticateUser(cookieData);

    /** Authenticating the service */
    const serviceAuth = this.getServiceAuth();
    if (serviceAuth) this.authenticateService(serviceAuth);
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
