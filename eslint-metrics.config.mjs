import tsParser from '@typescript-eslint/parser';

export default [
  {
    files: ['**/*.tsx'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaFeatures: { jsx: true },
      },
    },
    rules: {
      'complexity': ['error', 1],
      'max-depth': ['error', 1],
      'max-lines-per-function': ['error', 1]
    }
  }
];
