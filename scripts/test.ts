/**Importing npm packages */
import { type SpawnSyncReturns, spawnSync } from 'node:child_process';
import fs from 'node:fs';
import colors from '@colors/colors/safe';

/** Declaring the constants */
const { red, bold, brightBlue } = colors;
const printTitle = (title: string) => console.log('\n' + brightBlue(bold(title)) + '\n');
const env = { ...structuredClone(process.env), NODE_ENV: 'test' };
const testArg = process.argv[2];
const runUnitTests = testArg === undefined || testArg === 'unit';
const runUITests = testArg === undefined || testArg === 'ui';
const runAPITests = testArg === undefined || testArg === 'api';
const processResult = (result: SpawnSyncReturns<Buffer>) => result.status != null && result.status !== 0 && process.exit(result.status);

/** Checking if the test argument is valid */
if (!runUnitTests && !runUITests && !runAPITests) {
  const error = red("Invalid test argument\nValid test arguments are: 'unit', 'ui', 'api'\nLeave empty to run all tests");
  console.error(error);
  process.exit(1);
}

/** Deleting the previous test results and reports if exists */
fs.rmSync('playwright-report', { recursive: true, force: true });
fs.rmSync('test-results', { recursive: true, force: true });

/** Running the tests */
if (runUnitTests) {
  printTitle('Running unit tests');
  const unitTestEnv = { ...env, APP_NAME: 'unit-test:shadow-accounts' };
  const result = spawnSync('bun', ['test', 'modules', '--preload', 'tests/modules/setup.ts'], { stdio: 'inherit', env: unitTestEnv });
  processResult(result);
}

if (runAPITests) {
  printTitle('Running API tests');
  const apiTestEnv = { ...env, APP_NAME: 'api-test:shadow-accounts' };
  const result = spawnSync('bun', ['test', 'apis', '--preload', 'tests/apis/setup.ts'], { stdio: 'inherit', env: apiTestEnv });
  processResult(result);
}

if (runUITests) {
  printTitle('Running UI tests\n');
  spawnSync('bun', ['run', 'build:css'], { stdio: 'ignore' });
  const result = spawnSync('bunx', ['playwright', 'test'], { stdio: 'inherit' });
  processResult(result);
}
