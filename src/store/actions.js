import * as types from './types'
import contract from '../dweb/contract'
import ipfs from '../dweb/ipfs'
import metamask from '../dweb/metamask'
import COMMENT_STATUS from '../enum/commentStatus'
import IPFS_STATUS from '../enum/ipfsStatus'
import TEXT_STATUS from '../enum/textStatus'

export default {
  [types.EDIT_COMMENT]: ({ commit, dispatch, state }, { id, text }) => {
    const parent = state.parents[id]
    commit('UNSET_COMMENT', { id, parent })
    commit('SET_PLACEHOLDER_COMMENT', { parent, text, id })

    return ipfs.setText(text).then(ipfsHash => {
      commit('SET_COMMENT_STATUS', { id, status: COMMENT_STATUS.PENDING_APPROVAL })
      return contract.editComment(id, ipfsHash, state.ethAddress)
        .on('transactionHash', () => {
          commit('SET_COMMENT_STATUS', { id, status: COMMENT_STATUS.PENDING_TX })
        })
        .on('receipt', function (receipt) {
          // remove the placeholder comment
          commit('UNSET_COMMENT', { id, parent })
          // load the new comment
          dispatch(types.FETCH_COMMENT, { id: id })
        })
        .on('error', err => {
          console.error(err)
          commit('SET_COMMENT_STATUS', { id, status: COMMENT_STATUS.ERROR })
        })
    }).catch(() => {
      commit('SET_COMMENT_STATUS', { id, status: COMMENT_STATUS.ERROR })
    })
  },

  [types.FETCH_COMMENT]: ({ commit, state, dispatch }, { id }) => {
    return contract.getComment(id).then(comment => {
      commit('SET_COMMENT', { comment })
      dispatch(types.FETCH_COMMENT_RESOURCES, { comment })
    })
  },

  [types.FETCH_COMMENTS]: ({ state, dispatch }, { id, numberToLoad }) => {
    const comment = state.comments[id]
    if (!comment) {
      // if the parent comment doesn't exist, go get it then run this function again
      dispatch(types.FETCH_COMMENT, { id }).then(() => {
        numberToLoad--
        dispatch(types.FETCH_COMMENTS, { id, numberToLoad })
      })
    } else {
      if (comment.child && numberToLoad > 0) {
        console.log(`(${numberToLoad})`, comment.id + ' -> ' + comment.child)
        numberToLoad--
        // get the child comment
        dispatch(types.FETCH_COMMENT, {
          id: comment.child
        }).then(() => {
          // recusively call this function with the child comment
          dispatch(types.FETCH_COMMENTS, {
            id: comment.child,
            numberToLoad
          })
        })
      }

      if (comment.sibling && numberToLoad > 0) {
        console.log(`(${numberToLoad})`, comment.id + ' -> ' + comment.sibling)
        numberToLoad--
        // get the sibling comment
        dispatch(types.FETCH_COMMENT, {
          id: comment.sibling
        }).then(() => {
          // recusively call this function with the sibling comment
          dispatch(types.FETCH_COMMENTS, {
            id: comment.sibling,
            numberToLoad
          })
        })
      }
    }
  },

  [types.FETCH_COMMENTS_BY_PERSON]: ({ state }, { address }) => {
    contract.getCommentsByPerson(address).then(result => {
      console.log('here')
      console.log(result)
    }).catch(console.error)
  },

  [types.FETCH_COMMENT_RESOURCES]: ({ state, dispatch }, { comment }) => {
    if (comment) {
      dispatch(types.FETCH_NAME, { address: comment.author })
      if (comment.author !== comment.moderator) {
        dispatch(types.FETCH_NAME, { address: comment.moderator })
      }
      dispatch(types.FETCH_TEXT, { id: comment.id })
    }
  },

  [types.FETCH_ETH_ADDRESS]: ({ commit, state }) => {
    return metamask.getAccounts().then(accounts => {
      console.log(accounts)
      if (accounts && accounts[0]) {
        commit('SET_ETH_ADDRESS', { ethAddress: accounts[0] })
      }
    })
  },

  [types.FETCH_NAME]: ({ commit, state }, { address }) => {
    if (state.names[address]) {
      return state.names[address]
    } else {
      return contract.getName(address).then(name => {
        commit('SET_NAME', { address, name })
      })
    }
  },

  [types.FETCH_TEXT]: ({ commit, state }, { id }) => {
    const ipfsHash = state.comments[id].ipfsHash
    commit('SET_TEXT_STATUS', { id, status: TEXT_STATUS.FETCHING })
    return ipfs.getText(ipfsHash).then(text => {
      commit('SET_TEXT_VALUE', { id, value: text })
      commit('SET_TEXT_STATUS', { id, status: TEXT_STATUS.SUCCESS })
    }).catch(err => {
      console.error(err)
      commit('SET_TEXT_STATUS', { id, status: TEXT_STATUS.ERROR })
      commit('SET_TEXT_ERROR_MESSAGE', { id, message: err.message })
    })
  },

  [types.MODERATE_COMMENT]: ({ commit, state }, { id }) => {
    commit('SET_COMMENT_STATUS', { id, status: COMMENT_STATUS.MOD_PENDING_APPROVAL })
    return contract.moderateComment(id, state.ethAddress)
      .on('transactionHash', () => {
        commit('SET_COMMENT_STATUS', { id, status: COMMENT_STATUS.MOD_PENDING_TX })
      })
      .on('receipt', function (receipt) {
        commit('SET_COMMENT_STATUS', { id, status: COMMENT_STATUS.SAVED })
        commit('SET_COMMENT_MODERATION', { id })
      })
      .on('error', err => {
        console.error(err)
        commit('SET_COMMENT_STATUS', { id, status: COMMENT_STATUS.MOD_ERROR })
      })
  },

  [types.PUBLISH_COMMENT]: ({ commit, state, dispatch }, { parent, text }) => {
    // add a placeholder comment
    // the placeholder Id needs to be bigger than all of the other ones
    // because it's the "most recent" comment
    const ids = Object.keys(state.comments).map(Number)
    const maxId = Math.max(...ids)
    const id = maxId + 1
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

  [types.REGISTER_NAME]: ({ commit, state }, { text }) => {
    return contract.registerName(text, state.ethAddress)
  },

  [types.REMOVE_COMMENT]: ({ commit, state }, { id, parent }) => {
    commit('UNSET_COMMENT', { id, parent })
  },

  [types.UPDATE_IPFS_CONNECTION]: ({ commit, state }, { url }) => {
    commit('SET_IPFS_STATUS', { status: IPFS_STATUS.CHECKING })
    const { hostname, port, protocol } = new URL(url)
    ipfs.updateConnection({ host: hostname, port, protocol: protocol.slice(0, -1) })
    return ipfs.getVersion().then(response => {
      commit('SET_IPFS_STATUS', { status: IPFS_STATUS.SUCCESS })
    }).catch(err => {
      console.error(err)
      commit('SET_IPFS_STATUS', { status: IPFS_STATUS.ERROR })
    })
  }
}
