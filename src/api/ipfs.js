const bs58 = require('bs58')
const IPFS = require('ipfs-api')
// const Readable = require('stream').Readable

const ipfs = new IPFS(process.env.ipfs)

export default {
  setText: text => {
    // const readableStream = new Readable()
    // readableStream.push('your text here')
    // readableStream.push(null)
    return ipfs.add(new Buffer(text)).then(results => {
      return results[0].hash
    })
  },
  getText: hash => {
    const hashHex = '1220' + hash.slice(2)
    const hashBytes = Buffer.from(hashHex, 'hex')
    const hashStr = bs58.encode(hashBytes)
    if (hashStr === 'QmNLei78zWmzUdbeRB3CiUfAizWUrbeeZh5K1rhAQKCh51') { // The 0x0000... hash
      return Promise.resolve('')
    } else {
      // return ipfs.cat(hashStr)
      return ipfs.get(hashStr).then(data => {
        const text = new TextDecoder('utf-8').decode(data[0].content)
        return text
      })
    }
  }
}
