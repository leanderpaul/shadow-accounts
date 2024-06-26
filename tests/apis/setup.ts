/**
 * Importing npm packages
 */
import { type Subprocess } from 'bun';
import { afterAll, beforeAll } from 'bun:test';

/**
 * Importing user defined packages
 */
import { Seeder } from '@app/seeder';

import { Auth } from '../utils';

/**
 * Defining types
 */

/**
 * Declaring the constants
 */
let proc: Subprocess | null = null;

beforeAll(async () => {
  /** Setting up the environment */
  const uri = process.env.DB_URI;
  const watch = process.env.TEST_WATCH;
  if (!uri) throw new Error('DB_URI not set for testing');
  if (watch) return;

  /** Deleting old test data and seeding the database */
  const seeder = await Seeder.init(true);
  await seeder.seedDatabase();
  await seeder.createUser({ email: 'test-user-1@shadow-apps.test', firstName: 'Tester One', verified: true });
  await seeder.createUser({ email: 'test-user-2@shadow-apps.test', firstName: 'Tester Two' });
  await seeder.close();

  const env = { ...process.env, NODE_ENV: 'test', PORT: '8081', APP_NAME: 'test:shadow-accounts' };
  const cwd = `${import.meta.dir}/../..`;
  proc = await new Promise<Subprocess>(resolve => {
    const ipc = (message: string, proc: Subprocess) => message === 'ready' && resolve(proc);
    Bun.spawn(['bun', 'run', 'src/main.ts'], { env, cwd, ipc, stdout: 'ignore' });
  });

  /** Initializing the mock sessions */
  await Auth.initSession('tester-1', 'test-user-1@shadow-apps.test');
  await Auth.initSession('tester-2', 'test-user-2@shadow-apps.test');
});

afterAll(() => proc?.kill(2));
