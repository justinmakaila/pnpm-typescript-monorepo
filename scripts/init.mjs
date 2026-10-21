import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

function argsToObject(args) {
  const options = {};
  for (let index = 0; index < args.length; index += 2) {
    const key = args[index];
    if (!['--name', '--scope'].includes(key) || !args[index + 1]) {
      throw new Error('Usage: pnpm init --name <project-name> --scope <npm-scope>');
    }
    options[key.slice(2)] = args[index + 1];
  }
  if (
    !options.name ||
    !options.scope ||
    !/^[a-z][a-z0-9._-]*$/.test(options.name) ||
    !/^[a-z][a-z0-9._-]*$/.test(options.scope)
  ) {
    throw new Error('Both --name and --scope are required, lowercase npm-safe identifiers');
  }
  return options;
}

export function initialize(directory, { name, scope }) {
  const relativeFiles = [
    'package.json',
    'packages/greeting/package.json',
    'apps/hello/package.json',
    'packages/greeting/test/greeting.test.mjs',
    'apps/hello/src/index.ts',
  ];
  // Fixed allowlist: never modify arbitrary files or user-added packages.
  const currentPackage = JSON.parse(
    readFileSync(path.join(directory, 'packages/greeting/package.json'), 'utf8'),
  );
  const oldScope = currentPackage.name.split('/')[0];
  for (const filename of relativeFiles) {
    const file = path.join(directory, filename);
    const before = readFileSync(file, 'utf8');
    let after = before.replaceAll(`${oldScope}/`, `@${scope}/`);
    if (filename === 'package.json') {
      const manifest = JSON.parse(after);
      manifest.name = name;
      // The demo-specific convenience command is renamed alongside its workspace.
      manifest.scripts.dev = manifest.scripts.dev.replaceAll(`${oldScope}/`, `@${scope}/`);
      after = `${JSON.stringify(manifest, null, 2)}\n`;
    }
    if (after !== before) writeFileSync(file, after);
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const options = argsToObject(process.argv.slice(2));
    initialize(root, options);
    console.info(`Initialized ${options.name} with @${options.scope} package namespace`);
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
