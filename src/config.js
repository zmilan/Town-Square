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

// read in attribute data
window.config.ipfsUrl = document.currentScript.getAttribute('data-ipfs-url') || window.config.ipfsUrl
window.config.ethereumUrl = document.currentScript.getAttribute('data-ethereum-url') || window.config.ethereumUrl
window.config.depthLimit = Number(document.currentScript.getAttribute('data-depth-limit')) || window.config.depthLimit
window.config.editorPlaceholderReply = document.currentScript.getAttribute('data-editor-placeholder-reply') || window.config.editorPlaceholderReply
window.config.editorPlaceholderTop = document.currentScript.getAttribute('data-editor-placeholder-top') || window.config.editorPlaceholderTop
window.config.clickThroughConfig = document.currentScript.getAttribute('data-click-through-config') || window.config.clickThroughConfig
window.config.rootCommentId = Number(document.currentScript.getAttribute('data-root-comment-id')) || window.config.rootCommentId

Object.freeze(window.config)

console.log(window.config)
