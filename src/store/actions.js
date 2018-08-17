import sanitize from 'sanitize-html'

import * as types from './types'
import contract from '../dweb/contract'
import ipfs from '../dweb/ipfs'
import COMMENT_STATUS from '../enum/commentStatus'
import ETHEREUM_STATUS from '../enum/ethereumStatus'
import IPFS_STATUS from '../enum/ipfsStatus'
import TEXT_STATUS from '../enum/textStatus'

export default {
  [types.FETCH_COMMENT]: ({ commit, state, dispatch }, { id }) => {
    return contract.getComment(id).then(comment => {
      commit('SET_COMMENT', { comment })
      dispatch(types.FETCH_TEXT, { id })
    })
  },

  [types.FETCH_COMMENTS]: ({ state, dispatch }, { id, numberToLoad, depth }) => {
    const comment = state.comments[id]
    if (!comment) {
      // if the parent comment doesn't exist, go get it then run this function again
      dispatch(types.FETCH_COMMENT, { id }).then(() => {
        numberToLoad--
        depth--
        dispatch(types.FETCH_COMMENTS, { id, numberToLoad, depth })
      })
    } else {
      if (comment.child && numberToLoad > 0 && depth > 0) {
        numberToLoad--
        // get the child comment
        dispatch(types.FETCH_COMMENT, {
          id: comment.child
        }).then(() => {
          depth--
          // recusively call this function with the child comment
          dispatch(types.FETCH_COMMENTS, {
            id: comment.child,
            numberToLoad,
            depth
          })
        })
      }

      if (comment.sibling && numberToLoad > 0) {
        numberToLoad--
        // get the sibling comment
        dispatch(types.FETCH_COMMENT, {
          id: comment.sibling
        }).then(() => {
          // recusively call this function with the sibling comment
          dispatch(types.FETCH_COMMENTS, {
            id: comment.sibling,
            numberToLoad,
            depth
          })
        })
      }
    }
  },

  [types.FETCH_COMMENTS_BY_PERSON]: ({ state }, { address }) => {
    contract.getCommentsByPerson(address).then(result => {
    }).catch(console.error)
  },

  [types.FETCH_TEXT]: ({ commit, state }, { id }) => {
    const ipfsHash = state.comments[id].ipfsHash
    commit('SET_TEXT_STATUS', { id, status: TEXT_STATUS.FETCHING })
    return ipfs.getText(ipfsHash).then(text => {
      commit('SET_TEXT_VALUE', { id, value: text })
      commit('SET_TEXT_STATUS', { id, status: TEXT_STATUS.SUCCESS })
    }).catch(err => {
      commit('SET_TEXT_STATUS', { id, status: TEXT_STATUS.ERROR })
      commit('SET_TEXT_ERROR_MESSAGE', { id, message: err.message })
    })
  },

  [types.PUBLISH_COMMENT]: ({ commit, state, dispatch }, { parent, text }) => {
    // add a placeholder comment
    // the placeholder Id needs to be bigger than all of the other ones
    // because it's the "most recent" comment
    const ids = Object.keys(state.comments).map(Number)
    const maxId = Math.max(...ids)
    const id = maxId + 1
    text = sanitize(text)
    commit('SET_PLACEHOLDER_COMMENT', { parent, text, id })

    // Upload the content to ipfs
    return ipfs.setText(text).then(ipfsHash => {
      commit('SET_COMMENT_STATUS', { id, status: COMMENT_STATUS.PENDING_APPROVAL })
      // now save the comment to the blockchain
      return contract.addComment(parent, ipfsHash, state.ethAddress)
        .on('transactionHash', () => {
          // this gets called when user clicks "confirm" in MetaMask
          commit('SET_COMMENT_STATUS', { id, status: COMMENT_STATUS.PENDING_TX })
        })
        .on('receipt', function (receipt) {
          // this gets called when the tx gets it's first confirmation
          const newCommentId = Number(receipt.events.Comment.returnValues[0])
          // parent.child must always point to the most recent child
          commit('SET_COMMENT_CHILD', { id: parent, child: newCommentId })
          // remove the placeholder comment
          commit('UNSET_COMMENT', { id, parent })
          // load the new comment
          dispatch(types.FETCH_COMMENT, { id: newCommentId })
        })
        .on('error', err => {
          // web3 error
          console.error(err)
          commit('SET_COMMENT_STATUS', { id, status: COMMENT_STATUS.ERROR })
        })
    }).catch(err => {
      // IPFS error
      console.error(err)
      commit('SET_COMMENT_STATUS', { id, status: COMMENT_STATUS.ERROR })
    })
  },

  [types.PUBLISH_THREAD]: ({ commit, state }, { moderator, text }) => {
    return ipfs.setText(text).then(ipfsHash => {
      return contract.startThread(ipfsHash, state.ethAddress, moderator)
    })
  },

  [types.REMOVE_COMMENT]: ({ commit, state }, { id, parent }) => {
    commit('UNSET_COMMENT', { id, parent })
  },

  [types.UPDATE_ETH_ADDRESS]: ({ commit, state }, { address }) => {
    commit('SET_ETH_ADDRESS', { address })
  },

  [types.UPDATE_ETHEREUM_CONNECTION]: ({ commit, state }, { url }) => {
    commit('SET_ETHEREUM_URL', { url })
    commit('SET_ETHEREUM_STATUS', { status: ETHEREUM_STATUS.CHECKING })

    return contract.connectToWeb3(url).then(() => {
      commit('SET_ETHEREUM_STATUS', { status: ETHEREUM_STATUS.SUCCESS })
    }).catch(err => {
      console.error(err)
      commit('SET_ETHEREUM_STATUS', { status: ETHEREUM_STATUS.ERROR })
    })
  },

  [types.UPDATE_IPFS_CONNECTION]: ({ commit, dispatch, state }, { url }) => {
    commit('SET_IPFS_URL', { url })
    commit('SET_IPFS_STATUS', { status: IPFS_STATUS.CHECKING })
    const { hostname, port, protocol } = new URL(url)
    ipfs.updateConnection({ host: hostname, port, protocol: protocol.slice(0, -1) })

    setTimeout(() => {
      if (state.ipfsStatus === IPFS_STATUS.CHECKING) {
        // checking is taking awhile, change status to still_checking
        commit('SET_IPFS_STATUS', { status: IPFS_STATUS.STILL_CHECKING })
      }
    }, 2500)

    return ipfs.getVersion().then(response => {
      commit('SET_IPFS_STATUS', { status: IPFS_STATUS.SUCCESS })
      // if ipfs is connected then try to refetch the texts with error status
      for (let key in state.texts) {
        const text = state.texts[key]
        if (text.status === TEXT_STATUS.ERROR) {
          dispatch(types.FETCH_TEXT, { id: key })
        }
      }
    }).catch(err => {
      console.error(err)
      commit('SET_IPFS_STATUS', { status: IPFS_STATUS.ERROR })
    })
  }
}
