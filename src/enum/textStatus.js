const TEXT_STATUS = {
  UNRESOLVED: Symbol('TEXT_UNRESOLVED'),
  FETCHING: Symbol('TEXT_FETCHING'),
  SUCCESS: Symbol('TEXT_SUCCESS'),
  ERROR: Symbol('TEXT_ERROR')
}

Object.freeze(TEXT_STATUS)

export default TEXT_STATUS
