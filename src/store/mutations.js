import Vue from 'vue'

import ls from './localStorage'
import {getFromStorage, saveToStorage, FETCH_COMMENT, ADD_COMMENT} from './types'

export default {
  [getFromStorage.type]: (state, payload = []) => payload.map(todo => state.todos.push(todo)),
  [saveToStorage.type]: (state, payload) => ls.save(state.todos || []),
  [FETCH_COMMENT.type]: (state, payload) => Vue.set(state.comments, payload.id, payload),
  [ADD_COMMENT.type]: (state, payload) => payload.map(comment => state.comments.push(comment))
}
