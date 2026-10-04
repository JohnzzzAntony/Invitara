import js from '@eslint/js';
import globals from 'globals';

export default [
  { ignores: ['node_modules/**', '.next/**', 'artifacts/**', 'data/**', 'vendor/**', 'public/vendor/**', '.claude/**', '.firecrawl/**', 'Claude outputs/**'] },
  { files: ['**/*.js', '**/*.mjs'], ...js.configs.recommended,
    languageOptions: { ecmaVersion: 'latest', globals: globals.node },
    rules: { 'no-unused-vars': ['error', { args: 'after-used', caughtErrors: 'none' }] } },
  { files: ['public/js/**/*.js'], languageOptions: { sourceType: 'script', globals: globals.browser } },
  { files: ['src/**/*.js'], languageOptions: { globals: globals.browser } },
];
