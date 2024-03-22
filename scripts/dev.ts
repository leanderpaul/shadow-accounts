/**
 * Importing npm packages
 */
import { spawn } from 'node:child_process';
import colors from '@colors/colors/safe';

/**
 * Importing user defined packages
 */

/**
 * Defining types
 */

/**
 * Declaring the constants
 */
const { gray, green, yellow } = colors;
const env = { ...structuredClone(process.env), NODE_ENV: 'development' };

const server = spawn('bun', ['run', '--watch', 'src/main.ts'], { stdio: 'inherit', env });
const tailwindcss = spawn('bun', ['run', '-i', 'build:css', '--watch'], { stdio: 'pipe', env });

tailwindcss.stderr.on('data', data => {
  const message = data.toString().trim();
  if (message.startsWith('Done in')) {
    const time = message.split(/[ .]/)[2];
    console.log(`${green('INFO')}  ${yellow('[TailwindCSS]')} ${green('Compiled CSS')} ${gray('+' + time)}`);
  }
});
