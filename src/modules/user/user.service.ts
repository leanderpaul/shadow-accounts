/**
 * Importing npm packages
 */
import { NeverError, type Projection } from '@leanderpaul/shadow-service';
import { Injectable } from '@nestjs/common';
import moment from 'moment';

/**
 * Importing user defined packages
 */
import { IAMError, IAMErrorCode } from '@app/errors';
import { DatabaseService, Digest, type ID, User, UserVariant } from '@app/modules/database';
import { type NativeUser, type OAuthUser, type UserEmail, type UserInfo, type UserRole, type UserSession } from '@app/modules/database/database.types';
import { Context, MailService } from '@app/services';

/**
 * Defining types
 */

export interface CreateUser {
  aid?: ID;
  accountName?: string;
  email: string;
  firstName: string;
  lastName?: string;
  verified?: boolean;
  role?: UserRole;
}

export interface CreateNativeUser extends CreateUser {
  password: string;
}

export interface CreateOAuthUser extends CreateUser {
  spuid: string;
  refreshToken: string;
}

export type CreateUserSession = Pick<UserSession, 'id' | 'ipAddr' | 'userAgent'>;

/**
 * Declaring the constants
 */
const defaultUserProjection: Projection<User> = { aid: 1, firstName: 1, lastName: 1, role: 1, status: 1 };

@Injectable()
export class UserService {
  private readonly accountModel;
  private readonly userModel;
  private readonly oauthUserModel;
  private readonly nativeUserModel;

  private readonly digestModel;

  constructor(
    databaseService: DatabaseService,
    private readonly mailService: MailService,
  ) {
    this.accountModel = databaseService.getAccountModel();
    this.userModel = databaseService.getUserModel();
    this.oauthUserModel = databaseService.getUserModel(UserVariant.OAUTH);
    this.nativeUserModel = databaseService.getUserModel(UserVariant.NATIVE);

    this.digestModel = databaseService.getDigestModel();
  }

  async getTotalUserCount(): Promise<number> {
    return await this.userModel.estimatedDocumentCount();
  }

  async getNativeUser(uidOrEmail: ID | string): Promise<UserInfo | null>;
  async getNativeUser<T extends keyof Omit<NativeUser, 'uid' | 'type'>>(uidOrEmail: ID | string, projection: T[]): Promise<Pick<NativeUser, 'uid' | 'type' | T> | null>;
  async getNativeUser(uidOrEmail: ID | string, projection: Projection<NativeUser>): Promise<NativeUser | null>;
  async getNativeUser<T>(uidOrEmail: ID | string, projection: Projection<NativeUser> | T[] = defaultUserProjection): Promise<NativeUser | null> {
    const query = typeof uidOrEmail === 'string' && uidOrEmail.includes('@') ? { 'emails.email': uidOrEmail } : { uid: uidOrEmail };
    return await this.nativeUserModel.findOne(query, projection).select('type').lean();
  }

  async getOAuthUser(uidOrEmail: ID | string): Promise<UserInfo | null>;
  async getOAuthUser<T extends keyof Omit<OAuthUser, 'uid' | 'type'>>(uidOrEmail: ID | string, projection: T[]): Promise<Pick<OAuthUser, 'uid' | 'type' | T> | null>;
  async getOAuthUser(uidOrEmail: ID | string, projection: Projection<OAuthUser>): Promise<OAuthUser | null>;
  async getOAuthUser<T>(uidOrEmail: ID | string, projection: Projection<OAuthUser> | T[] = defaultUserProjection): Promise<OAuthUser | null> {
    const query = typeof uidOrEmail === 'string' && uidOrEmail.includes('@') ? { 'emails.email': uidOrEmail } : { uid: uidOrEmail };
    return await this.oauthUserModel.findOne(query, projection).select('type').lean();
  }

  async getUser(uidOrEmail: ID | string): Promise<UserInfo | null>;
  async getUser<T extends keyof Omit<User, 'uid' | 'type'>>(uidOrEmail: ID | string, projection: T[]): Promise<Pick<User, 'uid' | 'type' | T> | null>;
  async getUser(uidOrEmail: ID | string, projection: Projection<User>): Promise<User | null>;
  async getUser<T>(uidOrEmail: ID | string, projection: T[] | Projection<User> = defaultUserProjection): Promise<User | null> {
    const query = typeof uidOrEmail === 'string' && uidOrEmail.includes('@') ? { 'emails.email': uidOrEmail } : { uid: uidOrEmail };
    return await this.userModel.findOne(query, projection).select('type').lean();
  }

  async createUser(newUser: CreateNativeUser | CreateOAuthUser, session?: CreateUserSession | null): Promise<User> {
    const emails = [{ email: newUser.email, isVerified: newUser.verified ?? false }];
    const userData = { ...newUser, emails, sessions: session ? [session] : [] };
    if (newUser.aid) {
      const account = await this.accountModel.findOne({ aid: newUser.aid }).lean();
      if (!account) throw new IAMError(IAMErrorCode.A001);
    } else {
      const account = await this.accountModel.create({ accountName: newUser.accountName });
      userData.aid = account.aid;
      userData.role = User.Role.SUPER_ADMIN;
    }
    const user = await ('password' in newUser ? this.nativeUserModel.create(userData) : this.oauthUserModel.create(userData));
    if (!newUser.verified) {
      const expiresAt = moment().add(30, 'day').toDate();
      const digest = Digest.generateDigest();
      const data = { aid: user.aid.toString(), uid: user.uid.toString(), email: newUser.email };
      await this.digestModel.create({ id: digest, type: Digest.Type.VERIFY_EMAIL, data, expiresAt });
      this.mailService.sendEmailVerificationMail(newUser.email, newUser.firstName, digest.toString('base64url'));
    }
    return user;
  }

  async verifyUserEmail(email: string): Promise<void> {
    const user = await this.nativeUserModel.findOne({ 'emails.email': email }).lean();
    if (!user) throw new IAMError(IAMErrorCode.U005);
    const userEmail = user.emails.find(e => e.email === email) as UserEmail;
    if (userEmail.verified) throw new IAMError(IAMErrorCode.U004);
    await this.nativeUserModel.updateOne({ uid: user.uid, 'emails.email': email }, { $set: { 'emails.$.verified': true } });
  }

  async updatePassword(oldPassword: string, newPassword: string): Promise<void> {
    const { uid } = Context.getCurrentUser(true);
    const user = await this.nativeUserModel.findOne({ uid }, 'password').lean();
    if (!user) throw new IAMError(IAMErrorCode.U001);
    const isValid = await Bun.password.verify(oldPassword, user.password);
    if (!isValid) throw new IAMError(IAMErrorCode.U007);
    await this.nativeUserModel.updateOne({ uid }, { $set: { password: newPassword } });
  }

  async updateUser(uidOrEmail: ID, update: Partial<Pick<User, 'firstName' | 'lastName' | 'imageUrl'>>): Promise<Pick<User, 'firstName' | 'lastName' | 'imageUrl'>> {
    const query = typeof uidOrEmail === 'string' ? { 'emails.email': uidOrEmail } : { uid: uidOrEmail };
    const projection = { firstName: 1, lastName: 1, imageUrl: 1 };
    const updatedUser = await this.userModel.findOneAndUpdate(query, { $set: update }, { projection }).lean();
    if (!updatedUser) throw new NeverError('User not present after updated');
    return updatedUser;
  }
}
