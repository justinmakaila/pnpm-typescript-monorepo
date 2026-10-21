import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import test from 'node:test';

test('the app consumes the compiled workspace package', () => {
  const result = spawnSync(process.execPath, ['dist/index.js', 'template'], {
    cwd: process.cwd(),
    encoding: 'utf8',
  });
  assert.equal(result.status, 0, result.stderr);
  assert.equal(result.stdout.trim(), 'Hello, template!');
});
