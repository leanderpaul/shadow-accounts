/**
 * Importing npm packages
 */
import mongoose from 'mongoose';
import { afterAll, beforeAll } from 'bun:test';
import { type Subprocess } from 'bun';

/**
 * Importing user defined packages
 */

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

  /** Deleting old test data */
  await mongoose.connect(uri);
  await mongoose.connection.db.dropDatabase();
  await mongoose.connection.close();

  const env = { ...process.env, NODE_ENV: 'test', PORT: '8081', APP_NAME: 'test:shadow-accounts' };
  const cwd = `${import.meta.dir}/..`;
  proc = await new Promise<Subprocess>(resolve => {
    const ipc = (message: string, proc: Subprocess) => message === 'ready' && resolve(proc);
    Bun.spawn(['bun', 'run', 'src/main.ts'], { env, cwd, ipc, stdout: 'ignore' });
  });
});

afterAll(() => proc?.kill(2));
