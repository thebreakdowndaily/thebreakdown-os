module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/tests/research/**/*.test.ts'],
  testTimeout: 30000,
  globals: {
    'ts-jest': {
      tsconfig: 'tsconfig.json',
    },
  },
};
