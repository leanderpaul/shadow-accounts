/**
 * Importing npm packages
 */
import { NeverError } from '@leanderpaul/shadow-service';
import { Injectable } from '@nestjs/common';

/**
 * Importing user defined packages
 */
import { IAMError, IAMErrorCode } from '@app/errors';
import { AppService, DatabaseService } from '@app/modules/database';
import { ServiceRole } from '@app/modules/database/database.types';
import { Logger } from '@app/services';

/**
 * Defining types
 */

export interface CreateService extends Omit<AppService, 'accessToken' | 'roles' | 'active' | 'allowRegistration' | 'createdAt' | 'updatedAt'> {
  roles?: ServiceRole[];
  allowRegistration?: boolean;
  active?: boolean;
}

export type UpdateService = Partial<Omit<AppService, 'accessToken' | 'roles' | 'createdAt' | 'updatedAt'>>;

/**
 * Declaring the constants
 */

@Injectable()
export class AppServiceService {
  private readonly logger = Logger.getLogger('AppServiceService');

  private readonly appServiceModel;

  private servicesCache = new Map<string, AppService>();

  constructor(databaseService: DatabaseService) {
    this.appServiceModel = databaseService.getAppServiceModel();
  }

  async loadServices(): Promise<void> {
    const servicesCache = new Map<string, AppService>();
    const services = await this.appServiceModel.find();
    for (const service of services) servicesCache.set(service.name, service);
    this.servicesCache = servicesCache;
  }

  async createService(newService: CreateService): Promise<string> {
    if (this.servicesCache.has(newService.name)) throw new IAMError(IAMErrorCode.AS002);
    const accessToken = AppService.generateAccessToken();
    const service = await this.appServiceModel.create({ ...newService, accessToken });
    this.servicesCache.set(service.name, service);
    this.logger.debug(`Service created: ${service.name}`);
    return accessToken;
  }

  getService(name: string): AppService | null {
    return this.servicesCache.get(name) ?? null;
  }

  async updateService(name: string, update: UpdateService): Promise<AppService> {
    const service = this.servicesCache.get(name);
    if (!service) throw new IAMError(IAMErrorCode.AS001);
    const updatedService = await this.appServiceModel.findOneAndUpdate({ name }, { $set: update });
    if (!updatedService) throw new NeverError('Service not found');
    this.servicesCache.set(name, updatedService);
    if (updatedService.name !== service.name) this.servicesCache.delete(service.name);
    return updatedService;
  }

  async addRole(serviceName: string, role: ServiceRole): Promise<void> {
    const service = this.servicesCache.get(serviceName);
    if (!service) throw new IAMError(IAMErrorCode.AS001);
    const roleExists = service.roles.some(r => r.name === role.name);
    if (roleExists) throw new IAMError(IAMErrorCode.AS006);
    await this.appServiceModel.updateOne({ name: serviceName }, { $push: { roles: role } });
    service.roles.push(role);
  }

  async removeRole(serviceName: string, roleName: string): Promise<void> {
    const service = this.servicesCache.get(serviceName);
    if (!service) throw new IAMError(IAMErrorCode.AS001);
    const role = service.roles.find(r => r.name === roleName);
    if (!role) throw new IAMError(IAMErrorCode.AS005);
    await this.appServiceModel.updateOne({ name: serviceName }, { $pull: { roles: { name: roleName } } });
    service.roles = service.roles.filter(r => r.name !== roleName);
  }

  async generateAccessToken(serviceName: string): Promise<string> {
    const service = this.servicesCache.get(serviceName);
    if (!service) throw new IAMError(IAMErrorCode.AS001);
    if (!service.active) throw new IAMError(IAMErrorCode.AS003);
    const accessToken = AppService.generateAccessToken();
    const updatedService = await this.appServiceModel.findOneAndUpdate({ name: serviceName }, { $set: { accessToken } });
    if (!updatedService) throw new NeverError('Service not found');
    this.servicesCache.set(serviceName, updatedService);
    return accessToken;
  }

  async deleteService(name: string): Promise<void> {
    if (!this.servicesCache.has(name)) throw new IAMError(IAMErrorCode.AS001);
    await this.appServiceModel.deleteOne({ name });
    this.servicesCache.delete(name);
  }
}
