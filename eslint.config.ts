import eslint from '@eslint/js'
import tseslint from 'typescript-eslint'
import wdio from 'eslint-plugin-wdio'
import prettier from 'eslint-config-prettier'

export default tseslint.config(
  {
    ignores: [
      'node_modules/',
      'allure-results/',
      'allure-report/',
      'logs/',
      'apps/',
      '**/*.apk',
      '**/*.ipa',
      'eslint.config.ts',
    ],
  },
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  wdio.configs['flat/recommended'],
  {
    files: ['**/*.ts'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
    },
  },
  prettier,
)
