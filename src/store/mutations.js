import Vue from 'vue'

import {ADD_COMMENT, EDIT_COMMENT, FETCH_COMMENT, FETCH_NAME, FETCH_TEXT, GET_ACCOUNT, MODERATE_COMMENT, REGISTER_NAME} from './types'

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
  [ADD_COMMENT.type]: (state, payload) => {
    // payload.map(comment => state.comments.push(comment))
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
  }
}
