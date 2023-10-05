/* eslint-disable */
export default {
  displayName:
    'application-templates-administration-of-occupational-safety-and-health-transfer-of-machine-ownership',
  preset: '../../../../../jest.preset.js',
  transform: {
    '^(?!.*\\.(js|jsx|ts|tsx|css|json)$)': '@nx/react/plugins/jest',
    '^.+\\.[tj]sx?$': ['babel-jest', { presets: ['@nx/react/babel'] }],
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  coverageDirectory:
    '../../../../../coverage/libs/application/templates/administration-of-occupational-safety-and-health/transfer-of-machine-ownership',
}
