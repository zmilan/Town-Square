var merge = require('webpack-merge')
var defaultEnv = require('./default.env')

module.exports = merge(defaultEnv, {
  version: '"r1"',
  NODE_ENV: '"production"',
  contractAddress: '"0xd5ea2406da16695ca291e1ebc617ef845eb942d8"' // mainnet
})
