module.exports = require('tsdx/dist/createJestConfig').createJestConfig('.', __dirname);

module.exports = function (wallaby) {
  return {
    autoDetect: true,
    testFramework: {
      configFile: './jest.config.wallaby.js',
    },
    setup(wallaby) {
      const jestConfig = require('./package.json').jest;
      jestConfig.setupFiles = jestConfig.setupFiles.map((url) => url.replace('<rootDir>', '.'));
      jestConfig.globals = { __DEV__: true };
      wallaby.testFramework.configure(jestConfig);
    },
  };
};
