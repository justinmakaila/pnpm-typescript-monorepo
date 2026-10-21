import assert from 'node:assert/strict';
import { cpSync, mkdirSync, mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import test from 'node:test';

import { initialize } from './init.mjs';

const root = path.resolve(import.meta.dirname, '..');

test('initialization updates a fixed set of files and is repeatable', () => {
  const temp = mkdtempSync(path.join(tmpdir(), 'template-init-'));
  try {
    for (const filename of [
      'package.json',
      'packages/greeting/package.json',
      'apps/hello/package.json',
      'packages/greeting/test/greeting.test.mjs',
      'apps/hello/src/index.ts',
    ]) {
      const destination = path.join(temp, filename);
      mkdirSync(path.dirname(destination), { recursive: true });
      cpSync(path.join(root, filename), destination, { force: true });
    }
    initialize(temp, { name: 'my-project', scope: 'my-team' });
    const after = readFileSync(path.join(temp, 'apps/hello/src/index.ts'), 'utf8');
    assert.match(after, /@my-team\/greeting/);
    assert.equal(JSON.parse(readFileSync(path.join(temp, 'package.json'))).name, 'my-project');
    initialize(temp, { name: 'my-project', scope: 'my-team' });
    assert.equal(readFileSync(path.join(temp, 'apps/hello/src/index.ts'), 'utf8'), after);
  } finally {
    rmSync(temp, { recursive: true, force: true });
  }
});
