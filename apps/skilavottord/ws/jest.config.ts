/* eslint-disable */
export default {
  preset: './jest.preset.js',
  rootDir: '../../..',
  roots: [__dirname],
  coverageDirectory: '<rootDir>/coverage/apps/skilavottord/ws',
  globalSetup: `${__dirname}/test/globalSetup.ts`,
  globalTeardown: `${__dirname}/test/globalTeardown.ts`,
  setupFilesAfterEnv: [`${__dirname}/test/setup.ts`],
  moduleFileExtensions: ['ts', 'js', 'html', 'json'],
  globals: {},
  displayName: 'skilavottord-ws',
  testEnvironment: 'node',
  transform: {
    '^.+\\.[tj]s$': [
      'ts-jest',
      {
        tsconfig: `${__dirname}/tsconfig.spec.json`,
        isolatedModules: true,
      },
    ],
  },
}
