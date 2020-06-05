module.exports = {
  testEnvironment: 'node',
  roots: ['<rootDir>/src', '<rootDir>/tests'],
  preset: 'ts-jest',
  transform: {
    '^.+\\.ts$': 'ts-jest'
  },
  testRegex: '.*\\.(spec|test).ts$',
  coveragePathIgnorePatterns: ['/node_modules/'],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: -250
    }
  },
  collectCoverageFrom: ['src/**/*.ts', 'tests/**/*.ts'],
  clearMocks: true,
  moduleFileExtensions: ['ts', 'js'],
  moduleDirectories: ['node_modules', 'src', 'tests'],
  moduleNameMapper: {
    '^/(.*)$': '<rootDir>/src/$1'
  },
  testPathIgnorePatterns: ['<rootDir>/lib/', '<rootDir>/node_modules/']
};
