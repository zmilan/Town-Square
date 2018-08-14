var merge = require('webpack-merge')
var defaultEnv = require('./default.env')

module.exports = merge(defaultEnv, {
  NODE_ENV: '"development"',
  contractAddress: '"0x560ee79ce5dea8482d1439541965001504043e9a"' // rinkby
})
