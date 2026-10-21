import js from '@eslint/js';
import { defineConfig, globalIgnores } from 'eslint/config';
import prettier from 'eslint-config-prettier';
import { createTypeScriptImportResolver } from 'eslint-import-resolver-typescript';
import importX from 'eslint-plugin-import-x';
import globals from 'globals';
import tseslint from 'typescript-eslint';

// A single config, used from the root even for package-level lint scripts.
// Add browser / framework-specific file blocks when an app actually needs them.
export default defineConfig([
  globalIgnores(['**/node_modules/**', '**/dist/**', '**/coverage/**', '**/*.tsbuildinfo']),
  {
    files: ['**/*.{js,mjs,ts,mts}'],
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    plugins: { 'import-x': importX },
    languageOptions: { globals: globals.node },
    settings: {
      'import-x/resolver-next': [
        createTypeScriptImportResolver({
          project: ['./packages/*/tsconfig.json', './apps/*/tsconfig.json'],
          alwaysTryTypes: true,
        }),
      ],
    },
    rules: {
      'import-x/no-unresolved': 'error',
      'import-x/order': [
        'error',
        {
          groups: [
            'builtin',
            'external',
            'internal',
            'parent',
            'sibling',
            'index',
            'object',
            'type',
          ],
          alphabetize: { order: 'asc', caseInsensitive: true },
          'newlines-between': 'always',
        },
      ],
    },
  },
  prettier,
]);
