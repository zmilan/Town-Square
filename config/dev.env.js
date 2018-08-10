var merge = require('webpack-merge')
var defaultEnv = require('./default.env')

module.exports = merge(defaultEnv, {
  NODE_ENV: '"development"',
  contractAddress: '"0xdacc63b45cd550be91b971b9246fb6f08fa148a7"' // rinkby
})
