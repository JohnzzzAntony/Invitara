import js from '@eslint/js';
import globals from 'globals';

export default [
  { ignores: ['node_modules/**', 'archive/**', 'artifacts/**', 'data/**', 'vendor/**', 'frontend/public/vendor/**', '.claude/**', '.firecrawl/**', 'Claude outputs/**'] },
  { files: ['**/*.js', '**/*.mjs'], ...js.configs.recommended,
    languageOptions: { ecmaVersion: 'latest', globals: globals.node },
    rules: { 'no-unused-vars': ['error', { args: 'after-used', caughtErrors: 'none' }] } },
  { files: ['frontend/public/js/**/*.js'], languageOptions: { sourceType: 'script', globals: globals.browser } },
  { files: ['frontend/motion/**/*.js'], languageOptions: { globals: globals.browser } },
];
