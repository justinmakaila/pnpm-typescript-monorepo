import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import test from 'node:test';

import { checkWorkspace } from './check-workspace.mjs';

function fixture() {
  const root = mkdtempSync(path.join(tmpdir(), 'workspace-policy-'));
  const write = (filename, content) => {
    const file = path.join(root, filename);
    mkdirSync(path.dirname(file), { recursive: true });
    writeFileSync(file, typeof content === 'string' ? content : JSON.stringify(content));
  };
  write('pnpm-workspace.yaml', 'packages:\n  - apps/*\n  - packages/*\n');
  write('packages/core/package.json', {
    name: '@example/core',
    private: true,
    type: 'module',
    exports: { '.': { types: './dist/index.d.ts', import: './dist/index.js' } },
    scripts: { build: 'x', lint: 'x', typecheck: 'x', test: 'x' },
  });
  write('packages/core/src/index.ts', 'export const number = 1;');
  write('apps/cli/package.json', {
    name: '@example/cli',
    private: true,
    type: 'module',
    scripts: { build: 'x', lint: 'x', typecheck: 'x', test: 'x' },
    dependencies: { '@example/core': 'workspace:*' },
  });
  write('apps/cli/src/main.ts', "import { number } from '@example/core';\nconsole.log(number);\n");
  return { root, write };
}

function scenario(name, mutate, expected) {
  test(name, () => {
    const f = fixture();
    try {
      mutate?.(f);
      const failures = checkWorkspace(f.root);
      if (expected) assert.match(failures.join('\n'), expected);
      else assert.deepEqual(failures, []);
    } finally {
      rmSync(f.root, { recursive: true, force: true });
    }
  });
}

scenario('valid manifest-based workspace', null, null);
scenario(
  'undeclared cross-package dependency is rejected',
  ({ write }) => {
    write('apps/cli/package.json', {
      name: '@example/cli',
      type: 'module',
      private: true,
      scripts: { build: 'x', lint: 'x', typecheck: 'x', test: 'x' },
    });
  },
  /declare workspace dependency/,
);
scenario(
  'private exports are rejected',
  ({ write }) => {
    write('apps/cli/src/main.ts', "import { number } from '@example/core/src/index.js';");
  },
  /not a public export/,
);
scenario(
  'cross-app imports are rejected',
  ({ write }) => {
    write('apps/other/package.json', {
      name: '@example/other',
      type: 'module',
      private: true,
      scripts: { build: 'x', lint: 'x', typecheck: 'x', test: 'x' },
    });
    write('apps/other/src/index.ts', "import '@example/cli';");
  },
  /cannot import application/,
);
scenario(
  'relative imports crossing packages are rejected',
  ({ write }) => {
    write('apps/cli/src/main.ts', "import '../../../packages/core/src/index.js';");
  },
  /relative import crosses workspace boundary/,
);
scenario(
  'missing workspace dependency names are rejected',
  ({ write }) => {
    write('apps/cli/package.json', {
      name: '@example/cli',
      type: 'module',
      private: true,
      scripts: { build: 'x', lint: 'x', typecheck: 'x', test: 'x' },
      dependencies: { '@example/missing': 'workspace:*' },
    });
  },
  /missing workspace package/,
);
scenario(
  'bad export targets are rejected',
  ({ write }) => {
    write('packages/core/package.json', {
      name: '@example/core',
      type: 'module',
      private: true,
      scripts: { build: 'x', lint: 'x', typecheck: 'x', test: 'x' },
      exports: { '.': { types: './src/index.ts', import: './src/index.ts' } },
    });
  },
  /dist-only/,
);

scenario(
  'a newly added package can be consumed without root policy edits',
  ({ write }) => {
    write('packages/extra/package.json', {
      name: '@example/extra',
      type: 'module',
      private: true,
      scripts: { build: 'x', lint: 'x', typecheck: 'x', test: 'x' },
      exports: { '.': { types: './dist/index.d.ts', import: './dist/index.js' } },
    });
    write('packages/extra/src/index.ts', 'export const extra = 2;');
    write('apps/cli/package.json', {
      name: '@example/cli',
      type: 'module',
      private: true,
      scripts: { build: 'x', lint: 'x', typecheck: 'x', test: 'x' },
      dependencies: { '@example/core': 'workspace:*', '@example/extra': 'workspace:*' },
    });
    write('apps/cli/src/main.ts', "import { extra } from '@example/extra'; console.log(extra);");
  },
  null,
);
