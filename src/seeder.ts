/**
 * Importing npm packages
 */
import { NeverError } from '@leanderpaul/shadow-service';
import { type INestApplicationContext, Module, type Type } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import mongoose from 'mongoose';

/**
 * Importing user defined packages
 */
import { IAMRoles } from './decorators';
import { type User } from './modules/database';
import { AppServiceService, SystemModule } from './modules/system';
import { type CreateUser, UserModule, UserService } from './modules/user';
import { ServiceAccountService } from './modules/user/service-account.service';
import { Logger } from './services';

/**
 * Defining types
 */

/**
 * Declaring the constants
 */
const password = 'Password@123';
const logger = { info: console.log, error: console.error }; // eslint-disable-line no-console

/**
 * Creating the users
 */

@Module({ imports: [UserModule, SystemModule] })
class SeederModule {}

export class Seeder {
  private readonly seededData = new Map<string, unknown>();
  private readonly logger = Logger.getLogger('Seeder');

  constructor(private readonly app: INestApplicationContext) {}

  static async init(clean?: true): Promise<Seeder> {
    if (clean) await Seeder.cleanDatabase();
    const app = await NestFactory.createApplicationContext(SeederModule, { logger: ['error'] });
    await app.init();
    return new Seeder(app);
  }

  static async cleanDatabase(): Promise<void> {
    const DB_URI = process.env.DB_URI;
    if (!DB_URI) return;

    await mongoose.connect(DB_URI);
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
  }

  getService<T>(service: Type<T>): T {
    return this.app.get(service);
  }

  getSeededData<T>(key: string): T {
    const data = this.seededData.get(key);
    if (!data) throw new NeverError('Data not found');
    return data as T;
  }

  async getUser(email: string): Promise<User> {
    const userService = this.getService(UserService);
    const user = await userService.getUser(email, {});
    if (!user) throw new Error('User not found');
    this.seededData.set(user.uid.toString(), user);
    return user;
  }

  async createUser(user: CreateUser): Promise<User> {
    const userService = this.getService(UserService);
    const createdUser = await userService.createUser({ ...user, password });
    this.seededData.set(user.email, createdUser);
    return createdUser;
  }

  async seedDatabase(): Promise<void> {
    const appService = this.getService(AppServiceService);
    const iam = appService.getService('iam');
    this.logger.debug(`IAM Service: ${JSON.stringify(iam)}`);
    const iamRoles = Object.values(IAMRoles).map(role => ({ name: role, description: role }));
    if (!iam) await appService.createService({ name: 'iam', displayName: 'IAM', description: 'Identity and Access Management', domain: 'accounts', roles: iamRoles });

    const userService = this.getService(UserService);
    const serviceAccountService = this.getService(ServiceAccountService);
    const adminEmail = 'admin@shadow-apps.com';
    const admin = await userService.getUser(adminEmail);
    this.logger.debug(`Admin User: ${JSON.stringify(admin)}`);
    if (!admin) {
      await userService.createUser({ email: adminEmail, firstName: 'Administrator', password, verified: true });
      await serviceAccountService.createServiceAccount(adminEmail, 'iam', IAMRoles.Admin);
    }
  }

  async close(): Promise<void> {
    await this.app.close();
  }
}

if (import.meta.main) {
  const seeder = await Seeder.init();
  await seeder.seedDatabase();
  await seeder.close();
  logger.info('Database seeded successfully');
}
