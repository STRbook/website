module.exports = {
  transformIgnorePatterns: [
    "node_modules/(?!(axios)/)"
  ],
  moduleNameMapper: {
    '\\.(css|less|sass|scss)$': '<rootDir>/__mocks__/styleMock.js',
    '\\.(gif|ttf|eot|svg)$': '<rootDir>/__mocks__/fileMock.js'
  },
  testEnvironment: 'jsdom'
};
