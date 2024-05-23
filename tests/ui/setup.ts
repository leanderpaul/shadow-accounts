/** Importing user-defined packages */
import { UISeeder } from './ui-seeder';

/** Setting up the seeder */
const seeder = await UISeeder.init();

/** Global data */
await seeder.createUser('admin-1', { firstName: 'One', lastName: 'Admin', verified: true }, 'IAMAdmin');

await seeder.createUser('user-1', { firstName: 'One', lastName: 'Tester', verified: true });
await seeder.createUser('user-2', { firstName: 'Two' });

/** Clossing the connection */
await seeder.close();

/** start the app */
const { initApp } = await import('@app/main');
await initApp();
