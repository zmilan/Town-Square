const STATUS = {
  PENDING_IPFS: Symbol('PENDING_IPFS'),
  PENDING_APPROVAL: Symbol('PENDING_APPROVAL'),
  PENDING_TX: Symbol('PENDING_TX'),
  ERROR: Symbol('ERROR'),
  SAVED: Symbol('SAVED')
}
Object.freeze(STATUS)

export default STATUS
