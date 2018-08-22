var merge = require('webpack-merge')
var defaultEnv = require('./default.env')

module.exports = merge(defaultEnv, {
  version: '"1"',
  NODE_ENV: '"development"',
  contractAddress: '"0x506b83f21edc048e50b4732e3227ac59ea341a31"' // rinkeby
})
