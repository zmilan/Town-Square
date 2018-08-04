import {getFromStorage, saveToStorage, ADD_COMMENT, CREATE_THREAD, FETCH_COMMENT} from './types'
import ls from './localStorage'
import contract from '../api/contract'
import ipfs from '../api/ipfs'

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
      console.log(comment)
      return ipfs.getText(comment.ipfsHash)
    }).then(text => {
      comment.text = text
      commit(FETCH_COMMENT.type, comment)
    }).catch(err => {
      console.log(err)
    })
  },

  [getFromStorage.type] (context, todo) {
    context.commit(getFromStorage.type, ls.fetch())
  },

  [saveToStorage.type] (context, todo) {
    context.commit(saveToStorage.type)
  }
}
