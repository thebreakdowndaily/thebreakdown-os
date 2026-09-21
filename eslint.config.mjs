import js from '@eslint/js';
import ts from 'typescript-eslint';
import nextPlugin from '@next/eslint-plugin-next';
import reactHooks from 'eslint-plugin-react-hooks';
import react from 'eslint-plugin-react';
import globals from 'globals';

export default ts.config(
  js.configs.recommended,
  ...ts.configs.recommended.map((config) => ({
    ...config,
    ignores: ['.next/**', '.open-next/**', '.opencode/**', 'node_modules/**', 'dist/**', 'next-env.d.ts', 'tests/**', '*.js', '*.mjs'],
  })),
  {
    languageOptions: {
      parserOptions: {
        projectService: {
          allowDefaultProject: ['*.js', '*.mjs', 'app/*.js'],
        },
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  react.configs.flat['jsx-runtime'],
  {
    plugins: {
      '@next/next': nextPlugin,
      'react-hooks': reactHooks,
    },
    rules: {
      ...nextPlugin.configs.recommended.rules,
      ...nextPlugin.configs['core-web-vitals'].rules,
      ...reactHooks.configs.recommended.rules,
      '@next/next/no-html-link-for-pages': 'warn',
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
      '@typescript-eslint/no-empty-object-type': 'off',
      '@typescript-eslint/ban-ts-comment': 'warn',
      'react-hooks/set-state-in-effect': 'warn',
      'react-hooks/rules-of-hooks': 'warn',
      'react-hooks/purity': 'warn',
      'react-hooks/immutability': 'warn',
      'no-empty': ['error', { allowEmptyCatch: true }],
      'prefer-const': 'warn',
      'no-debugger': 'error',
      'no-duplicate-case': 'error',
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
  },
  {
    files: ['*.js', '*.mjs'],
    languageOptions: {
      globals: {
        ...globals.node,
      },
    },
  },
  {
    ignores: ['.next/**', '.open-next/**', '.opencode/**', 'node_modules/**', 'dist/**'],
  },
);
