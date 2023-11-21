/**
 * Importing npm packages
 */
import { NeverError } from '@leanderpaul/shadow-service';
import { type INestApplicationContext, Module, type Type } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';

/**
 * Importing user defined packages
 */
import { DatabaseService, type User } from './modules/database';
import { type CreateUser, UserModule, UserService } from './modules/user';

/**
 * Defining types
 */

/**
 * Declaring the constants
 */
const password = 'Password@123';

/**
 * Creating the users
 */

@Module({ imports: [UserModule] })
class SeederModule {}

export class Seeder {
  private readonly seededData = new Map<string, unknown>();
  private readonly sessions = new Map<string, string>();

  constructor(private readonly app: INestApplicationContext) {}

  static async init(): Promise<Seeder> {
    const app = await NestFactory.createApplicationContext(SeederModule, { logger: ['error'] });
    await app.init();
    return new Seeder(app);
  }

  getService<T>(service: Type<T>): T {
    return this.app.get(service);
  }

  getSeededData<T>(key: string): T {
    const data = this.seededData.get(key);
    if (!data) throw new NeverError('Data not found');
    return data as T;
  }

  async createUser(user: CreateUser, initSession: boolean = false): Promise<User> {
    const userService = this.getService(UserService);
    const userModel = this.getService(DatabaseService).getUserModel();
    const createdUser = await userService.createUser({ ...user, password }, initSession ? { id: 1 } : null);
    const userData = await userModel.findOne({ uid: createdUser.uid }).lean();
    if (!userData) throw new NeverError('User not found');
    const session = userData.sessions[0];
    this.seededData.set(user.email, userData);
    if (session) this.sessions.set(user.email, session.token);
    return userData;
  }

  async seedDatabase(clean: boolean = false): Promise<void> {
    if (clean) await this.getService(DatabaseService).getConnection().dropDatabase();
    const userService = this.getService(UserService);
    const admin = await userService.getUser('admin@shadow-apps.com');
    if (!admin) await userService.createUser({ email: 'admin@shadow-apps.com', firstName: 'Administrator', password });
  }

  async close(): Promise<void> {
    await this.app.close();
  }
}

if (import.meta.main) {
  const seeder = await Seeder.init();
  await seeder.seedDatabase();
  await seeder.close();
}
