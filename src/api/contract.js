import bs58 from 'bs58'
import Web3 from 'web3'
// overrides metamask v0.2 for our v 1.0
const web3 = new Web3(window.web3.currentProvider)

const address = process.env.contractAddress

//eslint-disable-next-line
const abi = [{"name": "__init__", "outputs": [], "inputs": [], "constant": false, "payable": false, "type": "constructor"}, {"name": "startThread", "outputs": [{"type": "int128", "name": "out"}], "inputs": [{"type": "address", "name": "_moderator"}, {"type": "bytes32", "name": "_ipfs_hash"}], "constant": false, "payable": false, "type": "function", "gas": 236366}, {"name": "addComment", "outputs": [{"type": "int128", "name": "out"}], "inputs": [{"type": "int128", "name": "_parent"}, {"type": "bytes32", "name": "_ipfs_hash"}], "constant": false, "payable": false, "type": "function", "gas": 287629}, {"name": "moderateComment", "outputs": [], "inputs": [{"type": "int128", "name": "_commentIndex"}, {"type": "bool", "name": "_moderated"}], "constant": false, "payable": false, "type": "function", "gas": 36166}, {"name": "comments__child", "outputs": [{"type": "int128", "name": "out"}], "inputs": [{"type": "int128", "name": "arg0"}], "constant": true, "payable": false, "type": "function", "gas": 874}, {"name": "comments__sibling", "outputs": [{"type": "int128", "name": "out"}], "inputs": [{"type": "int128", "name": "arg0"}], "constant": true, "payable": false, "type": "function", "gas": 904}, {"name": "comments__author", "outputs": [{"type": "address", "name": "out"}], "inputs": [{"type": "int128", "name": "arg0"}], "constant": true, "payable": false, "type": "function", "gas": 928}, {"name": "comments__ipfs_hash", "outputs": [{"type": "bytes32", "name": "out"}], "inputs": [{"type": "int128", "name": "arg0"}], "constant": true, "payable": false, "type": "function", "gas": 964}, {"name": "comments__moderator", "outputs": [{"type": "address", "name": "out"}], "inputs": [{"type": "int128", "name": "arg0"}], "constant": true, "payable": false, "type": "function", "gas": 994}, {"name": "comments__moderated", "outputs": [{"type": "bool", "name": "out"}], "inputs": [{"type": "int128", "name": "arg0"}], "constant": true, "payable": false, "type": "function", "gas": 1024}, {"name": "comments__date_posted", "outputs": [{"type": "uint256", "name": "out"}], "inputs": [{"type": "int128", "name": "arg0"}], "constant": true, "payable": false, "type": "function", "gas": 1054}, {"name": "comment_count", "outputs": [{"type": "int128", "name": "out"}], "inputs": [], "constant": true, "payable": false, "type": "function", "gas": 783}]

const contract = new web3.eth.Contract(abi, address)

export default {
  addComment: function (parent, ipfsHash) {
    const ipfsBytes32 = '0x' + bs58.decode(ipfsHash).slice(2).toString('hex')
    return web3.eth.getAccounts().then(accounts => {
      return contract.methods.addComment(parent, ipfsBytes32).send({
        from: accounts[0]
      })
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
      contract.methods.comments__date_posted(index).call()
    ]).then(results => {
      const comment = {
        child: Number(results[0]),
        sibling: Number(results[1]),
        author: results[2],
        ipfsHash: results[3],
        moderator: results[4],
        moderated: results[5],
        datePosted: results[6],
        id: index
      }

      return comment
    })
  }
}
