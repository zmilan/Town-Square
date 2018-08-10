import {makeAction} from 'async-action-creator'

export const ADD_COMMENT = makeAction('ADD_COMMENT')
export const ADD_PENDING_COMMENT = makeAction('ADD_PENDING_COMMENT')
export const CREATE_THREAD = makeAction('CREATE_THREAD')
export const CHANGE_COMMENT_STATUS = makeAction('CHANGE_COMMENT_STATUS')
export const EDIT_COMMENT = makeAction('EDIT_COMMENT')
export const FETCH_COMMENT_RESOURCES = makeAction('FETCH_COMMENT_RESOURCES')
export const FETCH_COMMENT = makeAction('FETCH_COMMENT')
export const FETCH_COMMENTS = makeAction('FETCH_COMMENTS')
export const FETCH_NAME = makeAction('FETCH_NAME')
export const FETCH_TEXT = makeAction('FETCH_TEXT')
export const MODERATE_COMMENT = makeAction('MODERATE_COMMENT')
export const REGISTER_NAME = makeAction('REGISTER_NAME')
export const REMOVE_PENDING_COMMMENT = makeAction('REMOVE_PENDING_COMMMENT')
export const UPDATE_COMMENT_CHILD = makeAction('UPDATE_COMMENT_CHILD')
export const UPDATE_PENDING_COMMENT = makeAction('UPDATE_PENDING_COMMENT')

export const GET_ACCOUNT = makeAction('GET_ACCOUNT')
