import {
  ADD_COMMENT,
  ADD_PENDING_COMMENT,
  CREATE_THREAD,
  EDIT_COMMENT,
  FETCH_COMMENT_RESOURCES,
  FETCH_COMMENT,
  FETCH_COMMENTS,
  FETCH_NAME,
  FETCH_TEXT,
  GET_ACCOUNT,
  MODERATE_COMMENT,
  REGISTER_NAME,
  REMOVE_PENDING_COMMMENT,
  UPDATE_PENDING_COMMENT } from './types'
import contract from '../dweb/contract'
import ipfs from '../dweb/ipfs'
import metamask from '../dweb/metamask'
import STATUS from '../enum/status'

export default {
  [ADD_COMMENT.type] ({ commit, state }, { parent, text }) {
    // a random key used to reference the pending comment
    const id = Math.random().toString(36).substring(7)
    commit(ADD_PENDING_COMMENT.type, { parent, text, id })

    return ipfs.setText(text).then(ipfsHash => {
      commit(UPDATE_PENDING_COMMENT.type, { id, status: STATUS.PENDING_APPROVAL })
      return contract.addComment(parent, ipfsHash, state.account)
    }).then(() => {
      commit(UPDATE_PENDING_COMMENT.type, { id, status: STATUS.PENDING_TX })
    }).catch(() => {
      commit(UPDATE_PENDING_COMMENT.type, { id, status: STATUS.ERROR })
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

  [FETCH_COMMENT_RESOURCES.type] ({ state, dispatch }, { comment }) {
    if (comment) {
      dispatch(FETCH_NAME.type, { address: comment.author })
      if (comment.author !== comment.moderator) {
        dispatch(FETCH_NAME.type, { address: comment.moderator })
      }
      dispatch(FETCH_TEXT.type, { id: comment.id })
    }
  },

  [FETCH_COMMENT.type] ({ commit, state, dispatch }, { id }) {
    return contract.getComment(id).then(comment => {
      commit(FETCH_COMMENT.type, { comment })
      dispatch(FETCH_COMMENT_RESOURCES.type, { comment })
    })
  },

  [FETCH_COMMENTS.type] ({ state, dispatch }, { id, numberToLoad }) {
    const comment = state.comments[id]
    if (!comment) {
      // if the parent comment doesn't exist, go get it then run this function again
      dispatch(FETCH_COMMENT.type, { id }).then(() => {
        numberToLoad--
        dispatch(FETCH_COMMENTS.type, { id, numberToLoad })
      })
    } else {
      if (comment.child && numberToLoad > 0) {
        console.log(`(${numberToLoad})`, comment.id + ' -> ' + comment.child)
        numberToLoad--
        // get the child comment
        dispatch(FETCH_COMMENT.type, {
          id: comment.child
        }).then(() => {
          // recusively call this function with the child comment
          dispatch(FETCH_COMMENTS.type, {
            id: comment.child,
            numberToLoad
          })
        })
      }

      if (comment.sibling && numberToLoad > 0) {
        console.log(`(${numberToLoad})`, comment.id + ' -> ' + comment.sibling)
        numberToLoad--
        // get the sibling comment
        dispatch(FETCH_COMMENT.type, {
          id: comment.sibling
        }).then(() => {
          // recusively call this function with the sibling comment
          dispatch(FETCH_COMMENTS.type, {
            id: comment.sibling,
            numberToLoad
          })
        })
      }
    }
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
        commit(GET_ACCOUNT.type, { account: accounts[0] })
      }
    })
  },

  [MODERATE_COMMENT.type] ({ commit, state }, { id, moderated }) {
    return contract.moderateComment(id, moderated, state.account)
  },

  [REGISTER_NAME.type] ({ commit, state }, { text }) {
    return contract.registerName(text, state.account)
  },

  [REMOVE_PENDING_COMMMENT.type] ({ commit, state }, { id }) {
    commit(REMOVE_PENDING_COMMMENT.type, { id })
  }
}
