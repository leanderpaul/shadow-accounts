/**
 * Importing npm packages
 */
import { Injectable, type OnApplicationShutdown } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { type Connection } from 'mongoose';

/**
 * Importing user defined packages
 */
import { Account, type AccountModel } from './accounts/account.model';
import { NativeUser, type NativeUserModel, OAuthUser, type OAuthUserModel, User, type UserModel } from './accounts/user.model';
import { Digest, type DigestModel, ResetPasswordDigest, type ResetPasswordDigestModel, VerifyEmailDigest, type VerifyEmailDigestModel } from './system/digest.model';

/**
 * Defining types
 */

export enum UserVariant {
  NATIVE,
  OAUTH,
}

export enum DigestVariant {
  VERIFY_EMAIL,
  RESET_PASSWORD,
}

/**
 * Declaring the constants
 */

@Injectable()
export class DatabaseService implements OnApplicationShutdown {
  constructor(
    @InjectConnection() private readonly connection: Connection,

    @InjectModel(Account.name) private readonly accountModel: AccountModel,
    @InjectModel(User.name) private readonly userModel: UserModel,
    @InjectModel(NativeUser.name) private readonly nativeUserModel: NativeUserModel,
    @InjectModel(OAuthUser.name) private readonly oauthUserModel: OAuthUserModel,

    @InjectModel(Digest.name) private readonly digestModel: DigestModel,
    @InjectModel(VerifyEmailDigest.name) private readonly verifyEmailDigestModel: VerifyEmailDigestModel,
    @InjectModel(ResetPasswordDigest.name) private readonly resetPasswordDigestModel: ResetPasswordDigestModel,
  ) {}

  onApplicationShutdown(): Promise<void> {
    return this.connection.close();
  }

  getConnection(): Connection {
    return this.connection;
  }

  getAccountModel(): AccountModel {
    return this.accountModel;
  }

  getUserModel(): UserModel;
  getUserModel(variant: UserVariant.NATIVE): NativeUserModel;
  getUserModel(variant: UserVariant.OAUTH): OAuthUserModel;
  getUserModel(variant?: UserVariant): UserModel | NativeUserModel | OAuthUserModel {
    return variant === undefined ? this.userModel : variant === UserVariant.NATIVE ? this.nativeUserModel : this.oauthUserModel;
  }

  getDigestModel(): DigestModel;
  getDigestModel(variant: DigestVariant.VERIFY_EMAIL): VerifyEmailDigestModel;
  getDigestModel(variant: DigestVariant.RESET_PASSWORD): ResetPasswordDigestModel;
  getDigestModel(variant?: DigestVariant): DigestModel | VerifyEmailDigestModel | ResetPasswordDigestModel {
    return variant === undefined ? this.digestModel : variant === DigestVariant.VERIFY_EMAIL ? this.verifyEmailDigestModel : this.resetPasswordDigestModel;
  }
}
