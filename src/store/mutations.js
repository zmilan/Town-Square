import Vue from 'vue'

import {FETCH_COMMENT, ADD_COMMENT, GET_ACCOUNT} from './types'

export default {
  [FETCH_COMMENT.type]: (state, payload) => {
    for (let id in state.comments) {
      const comment = state.comments[id]
      if (comment.sibling === payload.id) {
        if (state.comments[comment.parent].children.indexOf(payload.id) === -1) {
          state.comments[comment.parent].children.push(payload.id)
        }
        payload.parent = state.comments[comment.parent].id
        break
      }
      if (comment.child === payload.id) {
        if (comment.children.indexOf(payload.id) === -1) {
          comment.children.push(payload.id)
        }
        payload.parent = comment.id
        break
      }
    }
    Vue.set(state.comments, payload.id, payload)
  },
  [ADD_COMMENT.type]: (state, payload) => payload.map(comment => state.comments.push(comment)).ADD_COMMENT,
  [GET_ACCOUNT.type]: (state, payload) => state.account = payload // eslint-disable-line no-return-assign
}
