/**
 * Importing npm packages
 */
import { beforeAll } from 'bun:test';

/**
 * Importing user defined packages
 */
import { Seeder } from '@app/seeder';

/**
 * Defining types
 */

/**
 * Declaring the constants
 */

beforeAll(async () => {
  /** Setting up the environment */
  const uri = process.env.DB_URI;
  if (!uri) throw new Error('DB_URI not set for testing');

  /** Deleting old test data and seeding the database */
  const seeder = await Seeder.init();
  await seeder.seedDatabase(true);
  await seeder.createUser({ email: 'test-user-1@shadow-apps.test', firstName: 'Tester One', verified: true });
  await seeder.createUser({ email: 'test-user-2@shadow-apps.test', firstName: 'Tester Two' });
  await seeder.close();
});
