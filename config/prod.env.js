var merge = require('webpack-merge')
var defaultEnv = require('./default.env')

module.exports = merge(defaultEnv, {
  version: '"0.1.0"',
  NODE_ENV: '"development"', //TODO change this to production
  contractAddress: '"0xdacc63b45cd550be91b971b9246fb6f08fa148a7"' // rinkeby
})
