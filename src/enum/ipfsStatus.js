const IPFS_STATUS = {
  UNCHECKED: Symbol('IPFS_UNCHECKED'),
  CHECKING: Symbol('IPFS_CHECKING'),
  SUCCESS: Symbol('IPFS_SUCCESS'),
  ERROR: Symbol('IPFS_ERROR')
}

Object.freeze(IPFS_STATUS)

export default IPFS_STATUS
