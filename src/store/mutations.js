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
  REMOVE_COMMENT,
  UPDATE_COMMENT_CHILD,
  UPDATE_COMMENT_STATUS } from './types'

import STATUS from '../enum/status'

function addChildParentRelationship (state, child, parent) {
  Vue.set(state.parents, child, parent)

  // setup the children array if id doesnt exist yet
  if (!(state.children[parent] instanceof Array)) {
    Vue.set(state.children, parent, [])
  }

  // make sure we're not double adding the child
  if (state.children[parent].indexOf(child) === -1) {
    // add the child to the array
    state.children[parent].push(child)

    // the ordering of the array needs to be in reverse-chronological order
    // sort by (descending) comment id since the comment ids iterate in numerical order
    state.children[parent].sort((a, b) => b - a)
  }
}

export default {
  [ADD_PENDING_COMMENT.type]: (state, { parent, text, id }) => {
    const pendingComment = {
      author: state.account,
      status: STATUS.PENDING_IPFS,
      id: id
    }

    Vue.set(state.comments, id, pendingComment)
    Vue.set(state.texts, id, text)

    addChildParentRelationship(state, id, parent)
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
  [UPDATE_COMMENT_CHILD.type]: (state, { id, child }) => {
    // this mutation gets called when a new comment is added by the user.
    state.comments[id].child = child
  },
  [REMOVE_COMMENT.type]: (state, { id, parent }) => {
    // remove comment from list
    Vue.set(state.comments, id, null)

    // remove from children array
    const index = state.children[parent].indexOf(id)
    if (index >= 0) {
      state.children[parent].splice(index, 1)
    }

    // remove from parents array
    state.parents[id] = null

    // remove the text
    state.texts[id] = null
  },
  [UPDATE_COMMENT_STATUS.type]: (state, {id, status}) => {
    console.log(id, status)
    Vue.set(state.comments[id], 'status', status)
  }
}
