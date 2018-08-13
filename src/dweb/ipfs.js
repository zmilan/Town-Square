const bs58 = require('bs58')
// const IPFS = require('ipfs-api')
console.log(process.env)

// const ipfs = new IPFS(process.env.ipfs)
const ipfs = window.ipfs

export default {
  setText: text => {
    return ipfs.add(new Buffer(text)).then(results => {
      return results[0].hash
    })
  },
  getText: hash => {
    const hashHex = '1220' + hash.slice(2)
    const hashBytes = Buffer.from(hashHex, 'hex')
    const hashStr = bs58.encode(hashBytes)
    if (hashStr === 'QmNLei78zWmzUdbeRB3CiUfAizWUrbeeZh5K1rhAQKCh51') { // The hash value for 0x000000...
      return Promise.resolve('')
    } else {
      return ipfs.get(hashStr).then(data => {
        const text = new TextDecoder('utf-8').decode(data[0].content)
        return text
      })
    }
  }
  // ,
  // getVersion: host => {
  //   return axios({
  //     method: 'GET',
  //     url: '/api/v0/version',
  //     baseURL: host,
  //     params: { number: true },
  //   })
  // }
}
