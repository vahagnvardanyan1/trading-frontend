import { dirname } from 'path';
import { fileURLToPath } from 'url';

import nextConfig from 'eslint-config-next';
import prettierPlugin from 'eslint-plugin-prettier';
import tsParser from '@typescript-eslint/parser';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const ignores = ['node_modules/**', '.next/**', 'out/**', 'build/**', 'next-env.d.ts', 'public/**'];

const config = [
  {
    ignores,
  },
  ...nextConfig,
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    plugins: {
      prettier: prettierPlugin,
    },
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        project: './tsconfig.json',
        tsconfigRootDir: __dirname,
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
    },
    rules: {
      'prettier/prettier': ['error', {}, { usePrettierrc: true }],
      'react/display-name': 'off',
    },
  },
  {
    files: ['**/*.{ts,tsx}'],
    rules: {
      '@typescript-eslint/no-unused-vars': [
        2,
        {
          ignoreRestSiblings: true,
          argsIgnorePattern: '^_',
        },
      ],
      '@typescript-eslint/consistent-type-imports': [
        'error',
        {
          prefer: 'type-imports',
          disallowTypeAnnotations: true,
          fixStyle: 'separate-type-imports',
        },
      ],
      '@typescript-eslint/no-import-type-side-effects': 'error',
    },
  },
];

export default config;
