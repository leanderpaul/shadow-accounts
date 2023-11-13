/**
 * Importing npm packages
 */
import { faker } from '@faker-js/faker';
import { type INestApplicationContext } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';

/**
 * Importing user defined packages
 */
import { Account, DatabaseModule, DatabaseService, type ID, UserVariant } from './modules';
import { type User } from './modules/database/database.types';
import { Logger } from './services';

/**
 * Defining types
 */
export interface SeederOptions {
  /** Number of enterprise accounts to be created */
  accounts?: number;
  /** Number of users to be created per enterprise account */
  userPerAccount?: number;
  /** Number of personal accounts to be created */
  peronalUsers?: number;
}

type AccountWithUsers = Account & { users: User[] };

/**
 * Declaring the constants
 */
const password = 'Password@123';

class SeederService {
  private readonly logger = Logger.getLogger('seeder');
  private app: INestApplicationContext | null = null;

  private optional<T>(value: T): T | undefined {
    return faker.datatype.boolean() ? value : undefined;
  }

  private async getDatabaseService(): Promise<DatabaseService> {
    if (this.app) return this.app.get(DatabaseService);
    this.app = await NestFactory.createApplicationContext(DatabaseModule, { logger: ['warn', 'error'] });
    await this.app.init();
    return this.app.get(DatabaseService);
  }

  private async createUsers(aid: ID, isSuperAdmin: boolean = false): Promise<User> {
    const databaseService = await this.getDatabaseService();
    const userModel = databaseService.getUserModel(UserVariant.NATIVE);
    const gender = faker.datatype.boolean() ? 'male' : 'female';
    const firstName = faker.person.firstName(gender);
    const lastName = this.optional(faker.person.lastName(gender));
    const email = faker.internet.email({ firstName, lastName });
    const emails = [{ email, isVerified: faker.datatype.boolean() }];
    const role = isSuperAdmin ? Account.User.Role.SUPER_ADMIN : faker.number.int({ min: 0, max: 1 });
    const user = await userModel.create({ aid, emails, firstName, lastName, password, role });
    return user.toObject();
  }

  private async seedDefaultData(): Promise<void> {
    const databaseService = await this.getDatabaseService();
    const accountModel = databaseService.getAccountModel();
    const userModel = databaseService.getUserModel(UserVariant.NATIVE);
    const email = 'admin@shadow-apps.com';
    const adminExists = await userModel.exists({ 'emails.email': email });
    if (adminExists === null) {
      const account = await accountModel.create({ accountName: 'Shadow Apps' });
      const emails = [{ email: 'admin@shadow-apps.com', isVerified: true }];
      const user = await userModel.create({ aid: account.aid, emails, firstName: 'Admin', password, role: Account.User.Role.SUPER_ADMIN });
      this.logger.info(`Created super admin '${email}' with AID '${account.aid}' and UID '${user.uid}'`);
    }
    this.logger.info('Seeded default data');
  }

  async createEnterpriseAccounts(accounts: number, usersPerAccount: number): Promise<AccountWithUsers[]> {
    const databaseService = await this.getDatabaseService();
    const accountModel = databaseService.getAccountModel();
    const accountsWithUsers: AccountWithUsers[] = [];
    for (let accountIndex = 0; accountIndex < accounts; accountIndex++) {
      const account = await accountModel.create({ accountName: faker.company.name() });
      const users: User[] = [];
      this.logger.info(`Created enterprise account '${account.accountName}' with aid ${account.aid}`);
      for (let userIndex = 0; userIndex < usersPerAccount; userIndex++) {
        const user = await this.createUsers(account.aid, userIndex === 0);
        const email = user.emails[0]?.email;
        this.logger.info(`Created enterprise user '${email}' with AID '${account.aid}' and UID '${user.uid}'`);
        users.push(user);
      }
      accountsWithUsers.push({ ...account.toObject(), users });
    }
    this.logger.info(`Seeded ${accounts} enterprise accounts with ${usersPerAccount} users each`);
    return accountsWithUsers;
  }

  async createPersonalAccounts(accounts: number): Promise<AccountWithUsers[]> {
    const databaseService = await this.getDatabaseService();
    const accountModel = databaseService.getAccountModel();
    const accountsWithUsers: AccountWithUsers[] = [];
    for (let accountIndex = 0; accountIndex < accounts; accountIndex++) {
      const account = await accountModel.create({});
      const user = await this.createUsers(account.aid, true);
      const email = user.emails[0]?.email;
      this.logger.info(`Created personal user '${email}' with AID '${user.aid}' and UID '${user.uid}'`);
      accountsWithUsers.push({ ...account.toObject(), users: [user] });
    }
    this.logger.info(`Seeded ${accounts} personal accounts`);
    return accountsWithUsers;
  }

  async seed(opts: SeederOptions = {}) {
    await this.seedDefaultData();
    if (opts.accounts) await this.createEnterpriseAccounts(opts.accounts, opts.userPerAccount ?? 1);
    if (opts.peronalUsers) await this.createPersonalAccounts(opts.peronalUsers);
    this.logger.info('Seeding completed');
  }

  async dropDatabaseAndSeed(opts: SeederOptions = {}) {
    const databaseService = await this.getDatabaseService();
    const connection = databaseService.getConnection();
    await connection.dropDatabase();
    for (const model of connection.modelNames()) await connection.models[model]?.syncIndexes();
    await this.seed(opts);
  }

  async close() {
    if (this.app) await this.app.close();
  }
}

const globalRef = global as any;
export const Seeder: SeederService = globalRef.seederService || (globalRef.seederService = new SeederService());

if (import.meta.path === Bun.main) {
  const { default: inquirer } = await import('inquirer');
  const seederOptions = await inquirer.prompt<SeederOptions>([
    { type: 'number', name: 'accounts', message: 'Number of enterprise accounts to be created', default: 1 },
    { type: 'number', name: 'userPerAccount', message: 'Number of users to be created per enterprise account', default: 1 },
    { type: 'number', name: 'peronalUsers', message: 'Number of personal accounts to be created', default: 1 },
  ]);
  await Seeder.dropDatabaseAndSeed(seederOptions);
  await Seeder.close();
}
