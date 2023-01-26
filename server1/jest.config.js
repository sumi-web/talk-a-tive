/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/**/*.test.ts'],
  verbose: true, //  each individual test gonna be reported if failed at run
  forceExit: true,
  // clearMocks: true,
};
