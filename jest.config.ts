import type { Config } from '@jest/types';

// Sync object
const config: Config.InitialOptions = {
  verbose: true,
  transform: {
    '^.+\\.ts?$': 'ts-jest',
  },
  testRegex: '/(tests|src)/.*.(test|spec)(\\..+)?\\.ts$',
  'collectCoverageFrom': ['src/**/*.ts'],
};

export default config;
