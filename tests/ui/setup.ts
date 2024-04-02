/** Importing user-defined packages */
import { UISeeder } from './ui-seeder';

/** Setting up the seeder */
const seeder = await UISeeder.init();

/** Global data */
await seeder.createUser(1, { firstName: 'One', lastName: 'Tester', verified: true });
await seeder.createUser(2, { firstName: 'Two' });

/** Clossing the connection */
await seeder.close();

/** start the app */
const { initApp } = await import('@app/main');
await initApp();
