var merge = require('webpack-merge')
var defaultEnv = require('./default.env')

module.exports = merge(defaultEnv, {
  version: '"r1"',
  NODE_ENV: '"development"',
  contractAddress: '"0xc418cc5d3c5ffc635cd1db231662ba6e25f77069"' // rinkeby
})
