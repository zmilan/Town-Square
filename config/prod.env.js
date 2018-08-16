var merge = require('webpack-merge')
var defaultEnv = require('./default.env')

module.exports = merge(defaultEnv, {
  version: '"0.1.0"',
  NODE_ENV: '"production"',
  contractAddress: '"0x66bf29301b4b162ad4e93f2ae2a105109d011f24"' // rinkeby
})
