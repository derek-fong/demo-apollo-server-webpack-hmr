module.exports = {
  collectCoverageFrom: ['./src/**/*.ts'],
  coveragePathIgnorePatterns: [
    '/node_modules/',
    './src/environment.ts',
    './src/main.ts',
  ],
  coverageReporters: ['json', 'lcov', 'text', 'clover', 'cobertura'],
  preset: 'ts-jest',
  testEnvironment: 'node',
};
