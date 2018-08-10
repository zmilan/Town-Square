import Vue from 'vue'

import {
  ADD_COMMENT,
  ADD_PENDING_COMMENT,
  EDIT_COMMENT,
  FETCH_COMMENT,
  FETCH_NAME,
  FETCH_TEXT,
  GET_ACCOUNT,
  MODERATE_COMMENT,
  REGISTER_NAME,
  REMOVE_PENDING_COMMMENT,
  UPDATE_PENDING_COMMENT } from './types'

import STATUS from '../enum/status'

function addChildParentRelationship (state, child, parent) {
  Vue.set(state.parents, child, parent)

  // setup the children array if id doesnt exist yet
  if (!(state.children[parent] instanceof Array)) {
    Vue.set(state.children, parent, [])
  }

  // make sure we're not double adding the child
  if (state.children[parent].indexOf(child) === -1) {
    // the state pushes the child
    state.children[parent].push(child)
  }
}

export default {
  [ADD_PENDING_COMMENT.type]: (state, { parent, text, id }) => {
    const pendingComment = {
      author: state.account,
      text: text,
      status: STATUS.PENDING_IPFS,
      id: id,
      parent: parent
    }

    Vue.set(state.pendingComments, id, pendingComment)
    if (!(state.pendingChildren[parent] instanceof Array)) {
      Vue.set(state.pendingChildren, parent, [])
    }
    state.pendingChildren[parent].unshift(id)
  },
  [ADD_COMMENT.type]: (state, { parent, text }) => {
    //
  },
  [EDIT_COMMENT.type]: (state, payload) => {
    // TODO
  },
  [FETCH_COMMENT.type]: (state, { comment }) => {
    Vue.set(state.comments, comment.id, comment)

    for (let id in state.comments) {
      const otherComment = state.comments[id]

      if (otherComment.sibling === comment.id) {
        const child = comment.id
        const parent = state.parents[otherComment.id]
        if (child && parent) {
          addChildParentRelationship(state, child, parent)
        }
        break
      }
      if (otherComment.child === comment.id) {
        const child = comment.id
        const parent = otherComment.id
        if (child && parent) {
          addChildParentRelationship(state, child, parent)
        }
        break
      }
    }
  },
  [FETCH_NAME.type]: (state, { address, name }) => {
    Vue.set(state.names, address, name)
  },
  [FETCH_TEXT.type]: (state, { id, text }) => {
    Vue.set(state.texts, id, text)
  },
  [GET_ACCOUNT.type]: (state, { account }) => {
    state.account = account
  },
  [MODERATE_COMMENT.type]: (state, payload) => {
    // TODO
  },
  [REGISTER_NAME.type]: (state, payload) => {
    // TODO
  },
  [REMOVE_PENDING_COMMMENT.type]: (state, { id }) => {
    Vue.set(state.pendingComments, id, null)
    for (let key in state.pendingChildren) {
      const index = state.pendingChildren[key].indexOf(id)
      if (index >= 0) {
        state.pendingChildren[key].splice(index, 1)
      }
    }
  },
  [UPDATE_PENDING_COMMENT.type]: (state, {id, status}) => {
    Vue.set(state.pendingComments[id], 'status', status)
    // state.pendingComments[id].status = status
  }
}
