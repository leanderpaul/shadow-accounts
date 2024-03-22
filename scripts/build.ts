import fs from 'node:fs';
import path from 'node:path';

/** Deleting the previous build if exists */
fs.rmSync('dist', { recursive: true, force: true });

/** Getting the current commit hash */
const gitProcess = Bun.spawnSync(['git', 'rev-parse', 'HEAD'], { stdout: 'pipe' });
const commitHash = gitProcess.stdout.toString().trim();

/** Building tailwindcss */
Bun.spawnSync(['bun', 'run', 'build:css'], { stderr: 'ignore' });

/** Removing unneccessary scripts from package.json and copying */
const { name, type, dependencies } = await Bun.file('package.json').json();
const distPackageJson = { name, type, commitHash, dependencies };
const distPackage = JSON.stringify(distPackageJson, null, 2);
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

/** Installing dependencies */
const distDir = path.join(process.cwd(), 'dist');
Bun.spawnSync(['bun', 'install'], { cwd: distDir });
Bun.spawnSync(['bun', 'install', '--frozen-lockfile'], { cwd: distDir });
