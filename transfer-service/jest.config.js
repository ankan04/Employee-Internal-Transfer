/** Constitution §1: Jest. 85% floor on domain, authorization and audit modules. */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/test/**/*.test.ts'],
  collectCoverageFrom: ['src/**/*.ts'],
  // Constitution §1 sets the 85% floor per MODULE, not as an aggregate.
  // EX-01: a single 'src/domain/' key let domain/request pass at 73.91% behind
  // higher-covered siblings. One key per module is what the rule actually says.
  coverageThreshold: {
    'src/domain/request/**/*.ts': { lines: 85, statements: 85 },
    'src/domain/workflow/**/*.ts': { lines: 85, statements: 85 },
    'src/domain/validation/**/*.ts': { lines: 85, statements: 85 },
    'src/domain/authorization/**/*.ts': { lines: 85, statements: 85 },
    'src/persistence/auditWriter.ts': { lines: 85, statements: 85 },
  },
  testTimeout: 20000,
};
