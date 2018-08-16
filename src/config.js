import { getParameters } from './util/routeParameters'

// window.config is a global/immutable object that contains some initial config parameters
// Setup the default parameters.
window.config = {
  ipfsUrl: 'https://ipfs.infura.io:5001',
  ethereumUrl: process.env.NODE_ENV === 'production' ? 'https://mainnet.infura.io/v3/17a0bf02d6fb4fa9a97be85940caac51' : 'https://rinkeby.infura.io/v3/17a0bf02d6fb4fa9a97be85940caac51',
  depthLimit: Infinity,
  editorPlaceholderReply: 'What are your thoughts?',
  editorPlaceholderTop: 'Add your own post here...',
  clickThroughConfig: '', // must be base 58
  rootCommentId: 0
}

// read in url parameters and override default config
try {
  const configFromUrl = getParameters()
  for (let key in window.config) {
    if (configFromUrl.hasOwnProperty(key)) {
      window.config[key] = configFromUrl[key]
    }
  }
} catch (err) {
  console.error('couln\'t parse url parameters ', err)
}

Object.freeze(window.config)

console.log(window.config)
