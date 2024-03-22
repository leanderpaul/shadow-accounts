/**
 * Importing npm packages
 */
import lodash from 'lodash';
import fs from 'node:fs';

/**
 * Importing user defined packages
 */

/**
 * Defining types
 */

/**
 * Declaring the constants
 */

fs.rmSync('dist', { recursive: true, force: true });

Bun.spawnSync(['bun', 'run', 'build:css'], { stderr: 'ignore' });

/** Removing unneccessary scripts from package.json and copying */
const packageJson = await Bun.file('package.json').json();
const distPackageJson = lodash.pick(packageJson, ['name', 'type', 'version', 'main', 'dependencies', 'devDependencies']);
const distPackage = JSON.stringify(distPackageJson, null, 2);
// delete packageJson.scripts;
// const distPackage = JSON.stringify(packageJson, null, 2);
await Bun.write('dist/package.json', distPackage);

/** Copy the neccessary files and folders */
fs.cpSync('public', 'dist/public', { recursive: true });
fs.cpSync('src', 'dist/src', { recursive: true });
fs.cpSync('views', 'dist/views', { recursive: true });
fs.cpSync('bun.lockb', 'dist/bun.lockb');
fs.cpSync('bunfig.toml', 'dist/bunfig.toml');
fs.cpSync('tailwind.config.js', 'dist/tailwind.config.js');
fs.cpSync('tsconfig.json', 'dist/tsconfig.json');

/** Deleting unneccessary files and folders from dist */
fs.rmSync('dist/public/styles/main.css');

export {};
