export default {
  testEnvironment: 'node',
  testMatch: ['**/test/**/*.test.js'],
  collectCoverageFrom: ['scripts/**/*.js'],
  coverageThreshold: {
    global: { lines: 75, statements: 75, branches: 60, functions: 60 },
  },
}
