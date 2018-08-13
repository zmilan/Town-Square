const TEXT_STATUS = {
  WAITING: Symbol('TEXT_WAITING'),
  FETCHING: Symbol('TEXT_FETCHING'),
  SUCCESS: Symbol('TEXT_SUCCESS'),
  ERROR: Symbol('TEXT_ERROR')
}

Object.freeze(TEXT_STATUS)

export default TEXT_STATUS
