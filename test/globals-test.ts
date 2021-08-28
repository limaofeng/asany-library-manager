const cryptoMock = require('crypto');

Object.defineProperty(global.self, 'crypto', {
  value: {
    getRandomValues: (arr: string) => cryptoMock.randomBytes(arr.length),
  },
});
