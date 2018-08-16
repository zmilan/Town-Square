const ETHEREUM_STATUS = {
  UNCHECKED: Symbol('ETHEREUM_UNCHECKED'),
  CHECKING: Symbol('ETHEREUM_CHECKING'),
  // STILL_CHECKING: Symbol('IPFS_STILL_CHECKING'), // Used when checking is taking a while
  SUCCESS: Symbol('ETHEREUM_SUCCESS'),
  ERROR: Symbol('ETHEREUM_ERROR')
}

Object.freeze(ETHEREUM_STATUS)

export default ETHEREUM_STATUS
