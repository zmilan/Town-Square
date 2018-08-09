import {ADD_COMMENT, CREATE_THREAD, EDIT_COMMENT, FETCH_COMMENT, FETCH_NAME, FETCH_TEXT, GET_ACCOUNT, MODERATE_COMMENT, REGISTER_NAME} from './types'
import contract from '../dweb/contract'
import ipfs from '../dweb/ipfs'
import metamask from '../dweb/metamask'

export default {
  [ADD_COMMENT.type] ({ commit, state }, { parent, text }) {
    return ipfs.setText(text).then(ipfsHash => {
      return contract.addComment(parent, ipfsHash, state.account)
    })
  },

  [CREATE_THREAD.type] ({ commit, state }, { moderator, text }) {
    return ipfs.setText(text).then(ipfsHash => {
      return contract.startThread(ipfsHash, state.account, moderator)
    })
  },

  [EDIT_COMMENT.type] ({ commit, state }, { id, text }) {
    return ipfs.setText(text).then(ipfsHash => {
      return contract.editComment(id, ipfsHash, state.account)
    }).then(txInfo => {
      commit(EDIT_COMMENT.type, text)
    })
  },

  [FETCH_COMMENT.type] ({ commit, state }, { id }) {
    return contract.getComment(id).then(comment => {
      commit(FETCH_COMMENT.type, comment)
    })
  },

  [FETCH_NAME.type] ({ commit, state }, { address }) {
    if (state.names[address]) {
      return state.names[address]
    } else {
      return contract.getName(address).then(name => {
        commit(FETCH_NAME.type, { address, name })
      })
    }
  },

  [FETCH_TEXT.type] ({ commit, state }, { id }) {
    const ipfsHash = state.comments[id].ipfsHash
    return ipfs.getText(ipfsHash).then(text => {
      commit(FETCH_TEXT.type, { id, text })
    })
  },

  [GET_ACCOUNT.type] ({ commit, state }) {
    return metamask.getAccounts().then(accounts => {
      console.log(accounts)
      if (accounts && accounts[0]) {
        commit(GET_ACCOUNT.type, accounts[0])
      }
    })
  },

  [MODERATE_COMMENT.type] ({ commit, state }, { id, moderated }) {
    return contract.moderateComment(id, moderated, state.account)
  },

  [REGISTER_NAME.type] ({ commit, state }, { text }) {
    return contract.registerName(text, state.account)
  }
}
