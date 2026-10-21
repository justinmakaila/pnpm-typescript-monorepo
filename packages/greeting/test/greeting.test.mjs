import assert from 'node:assert/strict';
import test from 'node:test';

import { greet } from '@workspace/greeting';

test('public export is usable by a consumer', () => {
  assert.equal(greet({ name: '  monorepo  ' }), 'Hello, monorepo!');
});

test('invalid input is rejected', () => {
  assert.throws(() => greet({ name: ' ' }), /non-empty/);
});
