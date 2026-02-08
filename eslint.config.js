import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'

export default [
  { ignores: ['dist'] },
  {
    files: ['**/*.{js,jsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parserOptions: {
        ecmaVersion: 'latest',
        ecmaFeatures: { jsx: true },
        sourceType: 'module',
      },
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...js.configs.recommended.rules,
      ...reactHooks.configs.recommended.rules,
      'no-unused-vars': ['warn', { 
        varsIgnorePattern: '^_|^[A-Z]', 
        argsIgnorePattern: '^_', 
        caughtErrors: 'none',
        vars: 'all',
        args: 'after-used'
      }],
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],
    },
  },
  // Config files (node environment)
  {
    files: ['*.config.js', '*.config.ts', 'playwright.config.js', 'vitest.config.js'],
    languageOptions: {
      globals: globals.node,
    },
  },
  // Test files
  {
    files: ['**/*.test.js', '**/*.test.jsx', 'src/test/**/*'],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
        global: 'readonly',
        vi: 'readonly',
        describe: 'readonly',
        it: 'readonly',
        expect: 'readonly',
        beforeEach: 'readonly',
        afterEach: 'readonly',
        beforeAll: 'readonly',
        afterAll: 'readonly',
      },
    },
  },
]
