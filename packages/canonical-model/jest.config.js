/** @type {import('jest').Config} */
const base = require('../../jest.config.base.js');

module.exports = {
  ...base,
  rootDir: '.',
  moduleNameMapper: {
    '^@enx/contracts$': '<rootDir>/../contracts/src/index.ts',
  },
};
