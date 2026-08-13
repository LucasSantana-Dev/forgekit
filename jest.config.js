export default {
  testEnvironment: 'node',
  testMatch: ['**/test/**/*.test.js'],
  testPathIgnorePatterns: ['/node_modules/', '/\\.stryker-tmp/'],
  collectCoverageFrom: ['scripts/**/*.js'],
  coverageThreshold: {
    global: { lines: 75, statements: 75, branches: 60, functions: 60 },
  },
}
