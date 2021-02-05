/* -----------------------------------
 *
 * Jest
 *
 * -------------------------------- */

module.exports = {
  testEnvironment: 'jsdom',
  globals: { __DEV__: true },
  roots: ['<rootDir>'],
  collectCoverage: true,
  collectCoverageFrom: ['<rootDir>/src/**/*.{ts,tsx}'],
  coverageDirectory: '<rootDir>/tests/coverage',
  modulePathIgnorePatterns: ['./obj'],
  coveragePathIgnorePatterns: ['/node_modules/', '(.*).d.ts'],
  setupFilesAfterEnv: ['<rootDir>/tests/setup.ts'],
  //   coverageThreshold: {
  //     global: {
  //       statements: 90,
  //       branches: 80,
  //       functions: 90,
  //       lines: 90,
  //     },
  //   },
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  transform: {
    '^.+\\.tsx?$': 'ts-jest',
  },
};
