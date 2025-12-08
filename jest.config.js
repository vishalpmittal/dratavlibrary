module.exports = {
  testEnvironment: 'node',
  roots: ['<rootDir>/test'],
  reporters: [
    'default',
    ['<rootDir>/test/jest-logger-reporter.js', { "logFile": 'test/logs/test.log' }]
  ]
};
