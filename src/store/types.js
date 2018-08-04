import {makeAction} from 'async-action-creator'

export const getFromStorage = makeAction('GET_FROM_STORAGE')
export const saveToStorage = makeAction('SAVE_TO_STORAGE')

export const ADD_COMMENT = makeAction('ADD_COMMENT')
export const CREATE_THREAD = makeAction('CREATE_THREAD')
export const FETCH_COMMENT = makeAction('FETCH_COMMENT')
