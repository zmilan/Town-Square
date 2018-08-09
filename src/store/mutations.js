import Vue from 'vue'

import {ADD_COMMENT, EDIT_COMMENT, FETCH_COMMENT, FETCH_NAME, FETCH_TEXT, GET_ACCOUNT, MODERATE_COMMENT, REGISTER_NAME} from './types'

export default {
  [ADD_COMMENT.type]: (state, payload) => payload.map(comment => state.comments.push(comment)).ADD_COMMENT,
  [EDIT_COMMENT.type]: (state, payload) => {
    // TODO
  },
  [FETCH_COMMENT.type]: (state, payload) => {
    for (let id in state.comments) {
      const comment = state.comments[id]

      if (state.names[comment.author]) {
        comment.authorName = state.names[comment.author]
      }
      if (state.names[comment.moderator]) {
        comment.moderatorName = state.names[comment.moderator]
      }

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
  [FETCH_NAME.type]: (state, { address, name }) => {
    state.names[address] = name
    for (let id in state.comments) {
      const comment = state.comments[id]
      if (comment.author === address) {
        comment.authorName = name
      }
      if (comment.moderator === address) {
        comment.moderatorName = name
      }
    }
  },
  [FETCH_TEXT.type]: (state, { id, text }) => {
    Vue.set(state.texts, id, text)
  },
  [GET_ACCOUNT.type]: (state, payload) => state.account = payload, // eslint-disable-line no-return-assign
  [MODERATE_COMMENT.type]: (state, payload) => {
    // TODO
  },
  [REGISTER_NAME.type]: (state, payload) => {
    // TODO
  }
}
