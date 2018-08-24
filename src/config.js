// config is a global/immutable object that contains some initial config parameters
// Setup the default parameters.
const embedded = !!document.currentScript.getAttribute('data-thread-id')
const config = {
  ipfsUrl: 'https://ipfs.infura.io:5001',
  ethereumUrl: process.env.NODE_ENV === 'production' ? 'https://mainnet.infura.io/v3/17a0bf02d6fb4fa9a97be85940caac51' : 'https://rinkeby.infura.io/v3/17a0bf02d6fb4fa9a97be85940caac51',
  depthLimit: embedded ? Infinity : 1,
  editorPlaceholderTop: 'What are your thoughts?', // Add your own post here...
  editorPlaceholderReply: 'What are your thoughts?',
  containerId: 'town-square',
  maxTextBytes: 1024 * 100, // 100 kB
  threadId: 0,
  initialThreadId: 0,
  ipfsHash: 'QmbeWHQan8JcL8Qbsix8q3ZzgvrVZFL1rpedURJVooHGLq',
  embedded
}

// if the site is on ipfs, use the value in the address bar, otherwise use the provided hash
if (!embedded) {
  const routeArray = window.location.toString().split('/')
  // ipfs address look like: <url>/ipfs/<hash>/
  const ipfsIndex = routeArray.lastIndexOf('ipfs')
  if (ipfsIndex > 0 && routeArray.length > ipfsIndex + 1) {
    config.ipfsHash = routeArray[ipfsIndex + 1]
  }
}

// read in attribute data
config.ipfsUrl = document.currentScript.getAttribute('data-ipfs-url') || config.ipfsUrl
config.ethereumUrl = document.currentScript.getAttribute('data-ethereum-url') || config.ethereumUrl
config.depthLimit = Number(document.currentScript.getAttribute('data-depth-limit')) || config.depthLimit
config.editorPlaceholderReply = document.currentScript.getAttribute('data-editor-placeholder-reply') || config.editorPlaceholderReply
config.editorPlaceholderTop = document.currentScript.getAttribute('data-editor-placeholder-top') || config.editorPlaceholderTop
config.containerId = document.currentScript.getAttribute('data-container-id') || config.containerId
config.maxTextBytes = document.currentScript.getAttribute('data-max-text-bytes') || config.maxTextBytes
config.threadId = Number(document.currentScript.getAttribute('data-thread-id')) || config.threadId
config.ipfsHash = Number(document.currentScript.getAttribute('data-ipfs-hash')) || config.ipfsHash

Object.freeze(config)

console.log(config)

export default config
