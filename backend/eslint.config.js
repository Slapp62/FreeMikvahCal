const js = require('@eslint/js');
const prettierConfig = require('eslint-config-prettier');

module.exports = [
  {
    ignores: ['public/**', 'node_modules/**', 'dist/**', 'build/**', 'coverage/**'],
  },
  js.configs.recommended,
  prettierConfig,
  {
    files: ['**/*.js'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'commonjs',
      globals: {
        // Node.js globals
        console: 'readonly',
        process: 'readonly',
        __dirname: 'readonly',
        __filename: 'readonly',
        module: 'readonly',
        require: 'readonly',
        exports: 'readonly',
        Buffer: 'readonly',
        setTimeout: 'readonly',
        clearTimeout: 'readonly',
        setInterval: 'readonly',
        clearInterval: 'readonly',
        setImmediate: 'readonly',
        clearImmediate: 'readonly',
      },
    },
    rules: {
      // Unused variables
      'no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],

      // Console statements
      'no-console': 'off',

      // Best practices
      'prefer-const': 'error',
      'no-var': 'error',
      eqeqeq: ['error', 'always', { null: 'ignore' }],
      'no-else-return': 'error',

      // Code quality
      'no-duplicate-imports': 'error',
      'no-unreachable': 'error',
    },
  },
];
