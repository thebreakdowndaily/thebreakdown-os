// jest.frontend.config.js
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  testMatch: ['**/components/**/*.test.tsx', '**/components/**/*.test.ts'],
  setupFilesAfterEnv: ['<rootDir>/jest.frontend.setup.ts'],
  globals: {
    'ts-jest': {
      tsconfig: 'tsconfig.frontend.json',
    },
  },
};
