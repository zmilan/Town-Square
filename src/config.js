import { getParameters } from './util/routeParameters'

// config is a global/immutable object that contains some initial config parameters
// Setup the default parameters.
const config = {
  ipfsUrl: 'https://ipfs.infura.io:5001',
  ethereumUrl: process.env.NODE_ENV === 'production' ? 'https://mainnet.infura.io/v3/17a0bf02d6fb4fa9a97be85940caac51' : 'https://rinkeby.infura.io/v3/17a0bf02d6fb4fa9a97be85940caac51',
  depthLimit: Infinity,
  // depthLimit: 1,
  editorPlaceholderReply: 'What are your thoughts?',
  editorPlaceholderTop: 'Add your own post here...',
  clickThroughConfig: '', // must be base 58
  containerId: 'town-square',
  threadId: 0
}

// read in url parameters and override default config
try {
  const configFromUrl = getParameters()
  for (let key in config) {
    if (configFromUrl.hasOwnProperty(key)) {
      config[key] = configFromUrl[key]
    }
  }
} catch (err) {
  console.error('couln\'t parse url parameters ', err)
}

// read in attribute data
config.ipfsUrl = document.currentScript.getAttribute('data-ipfs-url') || config.ipfsUrl
config.ethereumUrl = document.currentScript.getAttribute('data-ethereum-url') || config.ethereumUrl
config.depthLimit = Number(document.currentScript.getAttribute('data-depth-limit')) || config.depthLimit
config.editorPlaceholderReply = document.currentScript.getAttribute('data-editor-placeholder-reply') || config.editorPlaceholderReply
config.editorPlaceholderTop = document.currentScript.getAttribute('data-editor-placeholder-top') || config.editorPlaceholderTop
config.clickThroughConfig = document.currentScript.getAttribute('data-click-through-config') || config.clickThroughConfig
config.containerId = document.currentScript.getAttribute('data-container-id') || config.containerId
config.threadId = Number(document.currentScript.getAttribute('data-thread-id')) || config.threadId

Object.freeze(config)

console.log(config)

export default config
