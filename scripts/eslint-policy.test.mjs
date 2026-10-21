import assert from 'node:assert/strict';
import path from 'node:path';
import test from 'node:test';

import { ESLint } from 'eslint';

const cwd = path.resolve(import.meta.dirname, '..');
const eslint = new ESLint({ cwd });

async function lint(source) {
  const [result] = await eslint.lintText(source, {
    filePath: path.join(cwd, 'packages/greeting/src/policy-probe.ts'),
  });
  return result.messages;
}

test('TypeScript lint rules accept valid source', async () => {
  assert.deepEqual(await lint('export const value: string = "ok";'), []);
});

test('TypeScript lint rules reject explicit any', async () => {
  const messages = await lint('export const value: any = 1;');
  assert.ok(messages.some(({ ruleId }) => ruleId === '@typescript-eslint/no-explicit-any'));
});

test('import ordering rejects external before builtin', async () => {
  const messages = await lint(
    [
      "import { greet } from '@workspace/greeting';",
      "import { readFileSync } from 'node:fs';",
      'export const value = greet({ name: readFileSync.toString() });',
    ].join('\n'),
  );
  assert.ok(
    messages.some(({ ruleId }) => ruleId === 'import-x/order'),
    messages.map(({ message }) => message).join('\n'),
  );
});
