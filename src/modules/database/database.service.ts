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
import { ServiceAccount, type ServiceAccountModel } from './accounts/service-account.model';
import { NativeUser, type NativeUserModel, OAuthUser, type OAuthUserModel, User, type UserModel } from './accounts/user.model';
import { UpdateQueryHelper } from './helpers/update-query.helper';
import { AppService, type AppServiceModel } from './system/app-service.model';
import { Digest, type DigestModel } from './system/digest.model';

/**
 * Defining types
 */

export enum UserVariant {
  NATIVE,
  OAUTH,
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
    @InjectModel(ServiceAccount.name) private readonly serviceAccountModel: ServiceAccountModel,

    @InjectModel(AppService.name) private readonly appServiceModel: AppServiceModel,
    @InjectModel(Digest.name) private readonly digestModel: DigestModel,
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

  getServiceAccountModel(): ServiceAccountModel {
    return this.serviceAccountModel;
  }

  getAppServiceModel(): AppServiceModel {
    return this.appServiceModel;
  }

  getDigestModel(): DigestModel {
    return this.digestModel;
  }

  getUpdateQuery(update?: object): UpdateQueryHelper {
    return new UpdateQueryHelper(update);
  }
}
