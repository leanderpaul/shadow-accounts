/**
 * Importing npm packages
 */
import { execSync } from 'node:child_process';

/**
 * Importing user defined packages
 */

/**
 * Defining types
 */

/**
 * Declaring the constants
 */

export default function (): void {
  const env = { ...process.env, NODE_ENV: 'test' };
  execSync('bun run tests/ui/seed-data.ts', { env });
}
