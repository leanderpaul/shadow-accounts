/**
 * Importing npm packages
 */

/**
 * Importing user defined packages
 */
import { type CreateUser } from '@app/modules/user';
import { Seeder } from '@app/seeder';
import { Utils } from '@tests/utils';

/**
 * Defining types
 */

/**
 * Declaring the constants
 */
const browsers = ['chromium', 'firefox'];

export class UISeeder {
  private constructor(private readonly seeder: Seeder) {}

  static async init(): Promise<UISeeder> {
    const seeder = await Seeder.init(true);
    await seeder.seedDatabase();
    return new UISeeder(seeder);
  }

  async createUser(id: string, userData: Omit<CreateUser, 'email'>, adminRole?: string): Promise<void> {
    for (const browser of browsers) {
      const email = Utils.getEmail(id, browser);
      await this.seeder.createUser({ email, ...userData });
      if (adminRole) await this.seeder.createServiceAccount(email, 'iam', adminRole);
    }
  }

  close(): Promise<void> {
    return this.seeder.close();
  }
}
