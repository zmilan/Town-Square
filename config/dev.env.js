var merge = require('webpack-merge')
var defaultEnv = require('./default.env')

module.exports = merge(defaultEnv, {
  NODE_ENV: '"development"',
  contractAddress: '"0xa11621553e1f0d19a9060e1ccf34aea9e713ac32"' // rinkby
})
