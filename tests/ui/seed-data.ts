/**
 * Importing npm packages
 */

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

const seeder = await Seeder.init();
await seeder.seedDatabase(true);

/** Global data */
await seeder.createUser({ email: 'test-user-1@shadow-apps.test', firstName: 'Tester One', verified: true });
await seeder.createUser({ email: 'test-user-2@shadow-apps.test', firstName: 'Tester Two' });

/** Clossing the connection */
await seeder.close();
