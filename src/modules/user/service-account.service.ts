/**
 * Importing npm packages
 */
import { Injectable } from '@nestjs/common';

/**
 * Importing user defined packages
 */
import { IAMError, IAMErrorCode } from '@app/errors';
import { DatabaseService, type ID, User } from '@app/modules/database';
import { AppService, type ServiceAccount } from '@app/modules/database/database.types';
import { AppServiceService } from '@app/modules/system';

import { UserService } from './user.service';

/**
 * Defining types
 */

interface ValidUserAndService {
  user: Pick<User, 'uid' | 'status'>;
  service: AppService;
}

/**
 * Declaring the constants
 */

@Injectable()
export class ServiceAccountService {
  private readonly serviceAccountModel;

  constructor(
    databaseService: DatabaseService,
    private readonly appServiceService: AppServiceService,
    private readonly userService: UserService,
  ) {
    this.serviceAccountModel = databaseService.getServiceAccountModel();
  }

  private async validateUserAndService(uidOrEmail: ID | string, service: string, role?: string): Promise<ValidUserAndService> {
    const user = await this.userService.getUser(uidOrEmail, ['status']);
    if (!user) throw new IAMError(IAMErrorCode.U001);
    if (user.status !== User.Status.ACTIVE) throw new IAMError(IAMErrorCode.U006);

    const appService = this.appServiceService.getService(service);
    if (!appService) throw new IAMError(IAMErrorCode.AS001);
    if (!appService.active) throw new IAMError(IAMErrorCode.AS003);
    if (role) {
      const serviceRole = appService.roles.find(r => r.name === role);
      if (!serviceRole) throw new IAMError(IAMErrorCode.AS007);
    }

    return { user, service: appService };
  }

  getServiceAccount(uid: ID, service: string): Promise<ServiceAccount | null> {
    return this.serviceAccountModel.findOne({ uid, service }).lean();
  }

  async createServiceAccount(uidOrEmail: ID | string, service: string, role: string): Promise<ServiceAccount> {
    const { user } = await this.validateUserAndService(uidOrEmail, service, role);
    const serviceAccount = await this.serviceAccountModel.create({ uid: user.uid, service, role });
    return serviceAccount.toObject();
  }

  async updateServiceRole(uidOrEmail: ID | string, service: string, role: string): Promise<void> {
    const { user } = await this.validateUserAndService(uidOrEmail, service, role);
    await this.serviceAccountModel.updateOne({ uid: user.uid, service }, { role });
  }
}
