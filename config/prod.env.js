var merge = require('webpack-merge')
var defaultEnv = require('./default.env')

module.exports = merge(defaultEnv, {
  NODE_ENV: '"production"',
  contractAddress: "HMMM"
})
