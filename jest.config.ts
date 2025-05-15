import type { JestConfigWithTsJest } from 'ts-jest';

const config: JestConfigWithTsJest = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',          // gives window, raf, etc.
  globals: {
    'ts-jest': {
      tsconfig: './tsconfig.test.json'  // see next step
    }
  }
};
export default config;
