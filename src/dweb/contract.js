import bs58 from 'bs58'
import Web3 from 'web3'
import COMMENT_STATUS from '../enum/commentStatus'
import Emitter from '../util/emitter'

let web3, contract

//eslint-disable-next-line
const abi = [{"name": "Comment", "inputs": [{"type": "int128", "name": "index", "indexed": false}, {"type": "address", "name": "author", "indexed": true}, {"type": "int128", "name": "_parent", "indexed": false}], "anonymous": false, "type": "event"}, {"name": "__init__", "outputs": [], "inputs": [], "constant": false, "payable": false, "type": "constructor"}, {"name": "startThread", "outputs": [], "inputs": [{"type": "address", "name": "_moderator"}, {"type": "bytes32", "name": "_ipfs_hash"}], "constant": false, "payable": false, "type": "function", "gas": 258681}, {"name": "addComment", "outputs": [{"type": "int128", "name": "out"}], "inputs": [{"type": "int128", "name": "_parent"}, {"type": "bytes32", "name": "_ipfs_hash"}], "constant": false, "payable": false, "type": "function", "gas": 310643}, {"name": "moderateComment", "outputs": [], "inputs": [{"type": "int128", "name": "_commentIndex"}, {"type": "bool", "name": "_moderated"}], "constant": false, "payable": false, "type": "function", "gas": 36166}, {"name": "editComment", "outputs": [], "inputs": [{"type": "int128", "name": "_commentIndex"}, {"type": "bytes32", "name": "_ipfs_hash"}], "constant": false, "payable": false, "type": "function", "gas": 71353}, {"name": "registerName", "outputs": [], "inputs": [{"type": "bytes32", "name": "_name"}], "constant": false, "payable": false, "type": "function", "gas": 35526}, {"name": "comments__child", "outputs": [{"type": "int128", "name": "out"}], "inputs": [{"type": "int128", "name": "arg0"}], "constant": true, "payable": false, "type": "function", "gas": 934}, {"name": "comments__sibling", "outputs": [{"type": "int128", "name": "out"}], "inputs": [{"type": "int128", "name": "arg0"}], "constant": true, "payable": false, "type": "function", "gas": 964}, {"name": "comments__author", "outputs": [{"type": "address", "name": "out"}], "inputs": [{"type": "int128", "name": "arg0"}], "constant": true, "payable": false, "type": "function", "gas": 988}, {"name": "comments__ipfs_hash", "outputs": [{"type": "bytes32", "name": "out"}], "inputs": [{"type": "int128", "name": "arg0"}], "constant": true, "payable": false, "type": "function", "gas": 1024}, {"name": "comments__moderator", "outputs": [{"type": "address", "name": "out"}], "inputs": [{"type": "int128", "name": "arg0"}], "constant": true, "payable": false, "type": "function", "gas": 1054}, {"name": "comments__moderated", "outputs": [{"type": "bool", "name": "out"}], "inputs": [{"type": "int128", "name": "arg0"}], "constant": true, "payable": false, "type": "function", "gas": 1084}, {"name": "comments__edited", "outputs": [{"type": "bool", "name": "out"}], "inputs": [{"type": "int128", "name": "arg0"}], "constant": true, "payable": false, "type": "function", "gas": 1114}, {"name": "comments__date_posted", "outputs": [{"type": "uint256", "name": "out"}], "inputs": [{"type": "int128", "name": "arg0"}], "constant": true, "payable": false, "type": "function", "gas": 1144}, {"name": "names", "outputs": [{"type": "bytes32", "name": "out"}], "inputs": [{"type": "address", "name": "arg0"}], "constant": true, "payable": false, "type": "function", "gas": 1045}, {"name": "comment_count", "outputs": [{"type": "int128", "name": "out"}], "inputs": [], "constant": true, "payable": false, "type": "function", "gas": 903}]
const contractAddress = process.env.contractAddress

function ipfsHashToBytes32 (ipfsHash) {
  return '0x' + bs58.decode(ipfsHash).slice(2).toString('hex')
}

export default {
  connectToWeb3: function (ethereumUrl) {
    if (typeof window.web3 !== 'undefined') {
      // connect via metamask
      web3 = new Web3(window.web3.currentProvider)
      web3.currentProvider.publicConfigStore.on('update', details => {
        Emitter.emit('Metamask-Update', details)
      })
    } else {
      // connect via remote node
      web3 = new Web3(new Web3.providers.HttpProvider(ethereumUrl))
    }

    return web3.eth.net.getNetworkType().then(type => {
      console.log('connected to ethereum ' + type + ' network')
      if (type === 'main' && process.env.NODE_ENV !== 'production') {
        throw new Error('Not connected to mainnet')
      } else if (type === 'rinkeby' && process.env.NODE_ENV !== 'development') {
        throw new Error('Not connected to rinkeby (development)')
      } else {
        // everything's set up right
        contract = new web3.eth.Contract(abi, contractAddress)
      }
    })
  },

  getComment: function (index) {
    return Promise.all([
      contract.methods.comments__child(index).call(),
      contract.methods.comments__sibling(index).call(),
      contract.methods.comments__author(index).call(),
      contract.methods.comments__ipfs_hash(index).call(),
      contract.methods.comments__date_posted(index).call()
    ]).then(results => {
      const comment = {
        child: Number(results[0]),
        sibling: Number(results[1]),
        author: results[2].toLowerCase(),
        ipfsHash: results[3],
        datePosted: results[4],
        status: COMMENT_STATUS.SAVED,
        id: index
      }

      return comment
    })
  },

  getCommentsByPerson: function (address) {
    return contract.getPastEvents('Comment', {
      filter: {author: address},
      fromBlock: 0,
      toBlock: 'latest'
    })
  },

  publishComment: function (parent, ipfsHash, account) {
    const ipfsBytes32 = ipfsHashToBytes32(ipfsHash)
    return contract.methods.publishComment(parent, ipfsBytes32).send({
      from: account
    })
  },

  publishThread: function (ipfsHash, account) {
    const ipfsBytes32 = ipfsHashToBytes32(ipfsHash)
    return contract.methods.publishThread(ipfsBytes32).send({
      from: account
    })
  }
}
