import bs58 from 'bs58'
const IPFS = require('ipfs-api')

let ipfs

export default {
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
  },
  getVersion: () => {
    return ipfs.version()
  },
  setText: text => {
    return ipfs.add(new Buffer(text)).then(results => {
      return results[0].hash
    })
  },
  updateConnection: ({ host, port, protocol }) => {
    ipfs = new IPFS({ host, port, protocol })
  }
}
