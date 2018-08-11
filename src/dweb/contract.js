import bs58 from 'bs58'
import Web3 from 'web3'
import STATUS from '../enum/status'
// overrides metamask v0.2 for our v 1.0
const web3 = new Web3(window.web3.currentProvider)

const address = process.env.contractAddress

//eslint-disable-next-line
const abi = [{"name": "Comment", "inputs": [{"type": "int128", "name": "index", "indexed": false}, {"type": "address", "name": "author", "indexed": true}, {"type": "int128", "name": "_parent", "indexed": false}], "anonymous": false, "type": "event"}, {"name": "__init__", "outputs": [], "inputs": [], "constant": false, "payable": false, "type": "constructor"}, {"name": "startThread", "outputs": [], "inputs": [{"type": "address", "name": "_moderator"}, {"type": "bytes32", "name": "_ipfs_hash"}], "constant": false, "payable": false, "type": "function", "gas": 258681}, {"name": "addComment", "outputs": [{"type": "int128", "name": "out"}], "inputs": [{"type": "int128", "name": "_parent"}, {"type": "bytes32", "name": "_ipfs_hash"}], "constant": false, "payable": false, "type": "function", "gas": 310643}, {"name": "moderateComment", "outputs": [], "inputs": [{"type": "int128", "name": "_commentIndex"}, {"type": "bool", "name": "_moderated"}], "constant": false, "payable": false, "type": "function", "gas": 36166}, {"name": "editComment", "outputs": [], "inputs": [{"type": "int128", "name": "_commentIndex"}, {"type": "bytes32", "name": "_ipfs_hash"}], "constant": false, "payable": false, "type": "function", "gas": 71353}, {"name": "registerName", "outputs": [], "inputs": [{"type": "bytes32", "name": "_name"}], "constant": false, "payable": false, "type": "function", "gas": 35526}, {"name": "comments__child", "outputs": [{"type": "int128", "name": "out"}], "inputs": [{"type": "int128", "name": "arg0"}], "constant": true, "payable": false, "type": "function", "gas": 934}, {"name": "comments__sibling", "outputs": [{"type": "int128", "name": "out"}], "inputs": [{"type": "int128", "name": "arg0"}], "constant": true, "payable": false, "type": "function", "gas": 964}, {"name": "comments__author", "outputs": [{"type": "address", "name": "out"}], "inputs": [{"type": "int128", "name": "arg0"}], "constant": true, "payable": false, "type": "function", "gas": 988}, {"name": "comments__ipfs_hash", "outputs": [{"type": "bytes32", "name": "out"}], "inputs": [{"type": "int128", "name": "arg0"}], "constant": true, "payable": false, "type": "function", "gas": 1024}, {"name": "comments__moderator", "outputs": [{"type": "address", "name": "out"}], "inputs": [{"type": "int128", "name": "arg0"}], "constant": true, "payable": false, "type": "function", "gas": 1054}, {"name": "comments__moderated", "outputs": [{"type": "bool", "name": "out"}], "inputs": [{"type": "int128", "name": "arg0"}], "constant": true, "payable": false, "type": "function", "gas": 1084}, {"name": "comments__edited", "outputs": [{"type": "bool", "name": "out"}], "inputs": [{"type": "int128", "name": "arg0"}], "constant": true, "payable": false, "type": "function", "gas": 1114}, {"name": "comments__date_posted", "outputs": [{"type": "uint256", "name": "out"}], "inputs": [{"type": "int128", "name": "arg0"}], "constant": true, "payable": false, "type": "function", "gas": 1144}, {"name": "names", "outputs": [{"type": "bytes32", "name": "out"}], "inputs": [{"type": "address", "name": "arg0"}], "constant": true, "payable": false, "type": "function", "gas": 1045}, {"name": "comment_count", "outputs": [{"type": "int128", "name": "out"}], "inputs": [], "constant": true, "payable": false, "type": "function", "gas": 903}]
const contract = new web3.eth.Contract(abi, address)

function ipfsHashToBytes32 (ipfsHash) {
  return '0x' + bs58.decode(ipfsHash).slice(2).toString('hex')
}

export default {
  addComment: function (parent, ipfsHash, account) {
    const ipfsBytes32 = ipfsHashToBytes32(ipfsHash)
    return contract.methods.addComment(parent, ipfsBytes32).send({
      from: account
    })
  },

  editComment: function (id, ipfsHash, account) {
    const ipfsBytes32 = ipfsHashToBytes32(ipfsHash)
    return contract.methods.editComment(id, ipfsBytes32).send({
      from: account
    })
  },

  getComment: function (index) {
    return Promise.all([
      contract.methods.comments__child(index).call(),
      contract.methods.comments__sibling(index).call(),
      contract.methods.comments__author(index).call(),
      contract.methods.comments__ipfs_hash(index).call(),
      contract.methods.comments__moderator(index).call(),
      contract.methods.comments__moderated(index).call(),
      contract.methods.comments__edited(index).call(),
      contract.methods.comments__date_posted(index).call()
    ]).then(results => {
      const comment = {
        child: Number(results[0]),
        sibling: Number(results[1]),
        author: results[2],
        ipfsHash: results[3],
        moderator: results[4],
        moderated: results[5],
        edited: results[6],
        datePosted: results[7],
        status: STATUS.SAVED,
        id: index
      }

      return comment
    })
  },

  getName: function (address) {
    return contract.methods.names(address).call().then(nameBytes32 => {
      const ascii = web3.utils.toAscii(nameBytes32)
      return ascii.replace(/\0/g, '') // strip out null characters /u0000
    })
  },

  moderateComment: function (id, moderated, account) {
    return contract.methods.moderateComment(id, moderated).send({
      from: account
    })
  },

  startThread: function (ipfsHash, account, moderator) {
    const ipfsBytes32 = ipfsHashToBytes32(ipfsHash)
    return contract.methods.startThread(moderator, ipfsBytes32).send({
      from: account
    })
  },

  registerName: function (name, account) {
    const nameBytes32 = web3.utils.fromAscii(name)
    return contract.methods.registerName(nameBytes32).send({
      from: account
    })
  }
}
