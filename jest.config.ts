import type { Config } from '@jest/types';

// Sync object
const config: Config.InitialOptions = {
  verbose: true,
  transform: {
    '^.+\\.ts?$': [
      'ts-jest',
      {
        isolatedModules: true,
      },
    ],
  },
  testRegex: '/(tests|src)/.*.(test|spec)(\\..+)?\\.ts$',
  'collectCoverageFrom': ['src/**/*.ts'],
  moduleNameMapper: {
    '^@in-memory-json(.*)$': '<rootDir>/src/implementations/in-memory-json$1',
    '^@core(.*)$': '<rootDir>/src/core$1',
  },
};

export default config;
