import bs58 from 'bs58'
import encoding from 'text-encoding' // most browsers have built in TextDecoder, but not IE/Safari/Edge
import sanitize from 'sanitize-html'
import config from '../config'
const IPFS = require('ipfs-api')

let ipfs

function lengthInUtf8Bytes (str) {
  // Matches only the 10.. bytes that are non-initial characters in a multi-byte sequence.
  const m = encodeURIComponent(str).match(/%[89ABab]/g)
  return str.length + (m ? m.length : 0)
}

function sanitizeImages (str) {
  return str.replace('![', '[')
}

export default {
  getText: hash => {
    const hashHex = '1220' + hash.slice(2)
    const hashBytes = Buffer.from(hashHex, 'hex')
    const hashStr = bs58.encode(hashBytes)

    return ipfs.object.stat(hashStr).then(stats => {
      if (stats.CumulativeSize > config.maxTextBytes) {
        throw new Error(`Text content is too long. Maximum allowed bytes is ${config.maxTextBytes}, this text is ${stats.CumulativeSize} bytes.`)
      }
      return ipfs.get(hashStr)
    }).then(data => {
      if (data[0].content && data[0].content.length) {
        const text = new encoding.TextDecoder('utf-8').decode(data[0].content)
        return sanitize(sanitizeImages(text))
      } else {
        return ''
      }
    })
  },
  getVersion: () => {
    return ipfs.version()
  },
  setText: text => {
    return new Promise((resolve, reject) => {
      const nBytes = lengthInUtf8Bytes(text)
      if (nBytes > config.maxTextBytes) {
        reject(new Error(`Text content is too long. Maximum allowed bytes is ${config.maxTextBytes}, this text is ${nBytes} bytes.`))
      }

      resolve()
    }).then(() => {
      return ipfs.add(new Buffer(text))
    }).then(results => {
      return results[0].hash
    })
  },
  updateConnection: ({ host, port, protocol }) => {
    ipfs = new IPFS({ host, port, protocol })
  }
}
