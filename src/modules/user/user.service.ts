/**
 * Importing npm packages
 */
import { type Projection } from '@leanderpaul/shadow-service';
import { Injectable } from '@nestjs/common';

/**
 * Importing user defined packages
 */
import { UpdateUserDto } from '@app/dtos/user';
import { IAMError, IAMErrorCode } from '@app/errors';
import { DatabaseService, type ID, User, UserVariant } from '@app/modules/database';
import { type NativeUser, type OAuthUser, type UserInfo, type UserRole, type UserSession } from '@app/modules/database/database.types';
import { Context, MailService } from '@app/services';

import { UserEmailService } from './user-email.service';

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
    private readonly databaseService: DatabaseService,
    private readonly userEmailService: UserEmailService,
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
  async getNativeUser<T extends keyof Omit<NativeUser, 'uid'>>(uidOrEmail: ID | string, projection: T[]): Promise<Pick<NativeUser, 'uid' | T> | null>;
  async getNativeUser(uidOrEmail: ID | string, projection: Projection<NativeUser>): Promise<NativeUser | null>;
  async getNativeUser<T>(uidOrEmail: ID | string, projection: Projection<NativeUser> | T[] = defaultUserProjection): Promise<NativeUser | null> {
    const query = typeof uidOrEmail === 'string' && uidOrEmail.includes('@') ? { 'emails.email': uidOrEmail } : { uid: uidOrEmail };
    return await this.nativeUserModel.findOne(query, projection).lean();
  }

  async getOAuthUser(uidOrEmail: ID | string): Promise<UserInfo | null>;
  async getOAuthUser<T extends keyof Omit<OAuthUser, 'uid'>>(uidOrEmail: ID | string, projection: T[]): Promise<Pick<OAuthUser, 'uid' | T> | null>;
  async getOAuthUser(uidOrEmail: ID | string, projection: Projection<OAuthUser>): Promise<OAuthUser | null>;
  async getOAuthUser<T>(uidOrEmail: ID | string, projection: Projection<OAuthUser> | T[] = defaultUserProjection): Promise<OAuthUser | null> {
    const query = typeof uidOrEmail === 'string' && uidOrEmail.includes('@') ? { 'emails.email': uidOrEmail } : { uid: uidOrEmail };
    return await this.oauthUserModel.findOne(query, projection).lean();
  }

  async getUser(uidOrEmail: ID | string): Promise<UserInfo | null>;
  async getUser<T extends keyof Omit<User, 'uid'>>(uidOrEmail: ID | string, projection: T[]): Promise<Pick<User, 'uid' | T> | null>;
  async getUser(uidOrEmail: ID | string, projection: Projection<User>): Promise<User | null>;
  async getUser<T>(uidOrEmail: ID | string, projection: T[] | Projection<User> = defaultUserProjection): Promise<User | null> {
    const query = typeof uidOrEmail === 'string' && uidOrEmail.includes('@') ? { 'emails.email': uidOrEmail } : { uid: uidOrEmail };
    return await this.userModel.findOne(query, projection).lean();
  }

  async createUser(newUser: CreateNativeUser | CreateOAuthUser, session?: CreateUserSession | null): Promise<User> {
    const emails = [{ email: newUser.email, verified: newUser.verified, primary: true }];
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
      const digest = await this.userEmailService.createVerifyEmailDigest(user.aid, user.uid, newUser.email);
      this.mailService.sendEmailVerificationMail(newUser.email, newUser.firstName, digest);
    }
    return user;
  }

  async updatePassword(oldPassword: string, newPassword: string): Promise<void> {
    const { uid } = Context.getCurrentUser(true);
    const user = await this.nativeUserModel.findOne({ uid }, 'password').lean();
    if (!user) throw new IAMError(IAMErrorCode.U001);
    const isValid = await Bun.password.verify(oldPassword, user.password);
    if (!isValid) throw new IAMError(IAMErrorCode.U007);
    await this.nativeUserModel.updateOne({ uid }, { $set: { password: newPassword } });
  }

  async updateUser(uidOrEmail: ID, update: UpdateUserDto): Promise<UserInfo | null>;
  async updateUser<T extends keyof Omit<User, 'uid'>>(uidOrEmail: ID, update: UpdateUserDto, projection: T[]): Promise<Pick<User, 'uid' | T> | null>;
  async updateUser(uidOrEmail: ID, update: UpdateUserDto, projection: Projection<User>): Promise<User | null>;
  async updateUser<T>(uidOrEmail: ID, update: UpdateUserDto, projection?: T[] | Projection<User>): Promise<User | null> {
    if (Object.keys(update).length === 0) return this.getUser(uidOrEmail, projection as Projection<User>);
    const query = typeof uidOrEmail === 'string' ? { 'emails.email': uidOrEmail } : { uid: uidOrEmail };
    if (!projection) projection = defaultUserProjection;
    const updateQuery = this.databaseService.getUpdateQuery(update);
    return await this.userModel.findOneAndUpdate(query, updateQuery.getUpdate(), { projection }).lean();
  }
}
