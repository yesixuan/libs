const path = require('path')
module.exports = {
  verbose: true,
  preset: 'ts-jest',
  // testEnvironment: 'node',
  collectCoverage: true, // 收集测试时的覆盖率信息
  coverageDirectory: path.resolve(__dirname, './coverage'), // 指定输出覆盖信息文件的目录
  collectCoverageFrom: [
    'packages/*/src/**/*.ts',
  ],
  testURL: 'https://www.shuidichou.com/jd', // 设置jsdom环境的URL
  testMatch: [
    '<rootDir>/packages/**/__tests__/**/*spec.[jt]s?(x)',
    '<rootDir>/packages/**/__tests__/**/*test.[jt]s?(x)'
  ],
  testPathIgnorePatterns: [ // 忽略测试路径
    '/node_modules/'
  ],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'json'],
  coverageThreshold: { // 配置测试最低阈值
    global: {
      branches: 60,
      functions: 80,
      lines: 80,
      statements: 80
    }
  },
  rootDir: __dirname
}
