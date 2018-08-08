import {ADD_COMMENT, CREATE_THREAD, FETCH_COMMENT, GET_ACCOUNT} from './types'
import contract from '../dweb/contract'
import ipfs from '../dweb/ipfs'
import metamask from '../dweb/metamask'

export default {
  [ADD_COMMENT.type] ({ commit, state }, { parent, text }) {
    ipfs.setText(text).then(ipfsHash => {
      return contract.addComment(parent, ipfsHash).then(txInfo => {
        // if (txInfo.status) {
        //   commit()
        // }
        // commit(ADD_COMMENT.type, comment)
      })
    })
  },

  [CREATE_THREAD.type] ({ commit, state }, { text }) {
    ipfs.setText(text).then(ipfsHash => {
      const parent = 0
      return contract.addComment(parent, ipfsHash)
    })
  },

  [FETCH_COMMENT.type] ({ commit, state }, { id }) {
    let comment
    contract.getComment(id).then(inComment => {
      comment = inComment
      return ipfs.getText(comment.ipfsHash)
    }).then(text => {
      comment.text = text
      commit(FETCH_COMMENT.type, comment)
    }).catch(err => {
      console.log(err)
    })
  },

  [GET_ACCOUNT.type] ({ commit, state }) {
    metamask.getAccounts().then(accounts => {
      console.log(accounts)
      if (accounts && accounts[0]) {
        commit(GET_ACCOUNT.type, accounts[0])
      }
    })
  }
}
