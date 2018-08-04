var merge = require('webpack-merge')
var defaultEnv = require('./default.env')

module.exports = merge(defaultEnv, {
  NODE_ENV: '"development"',
  contractAddress: '"0x66bf29301b4b162ad4e93f2ae2a105109d011f24"' // rinkby
})
