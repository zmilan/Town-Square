import ETHEREUM_STATUS from '../enum/ethereumStatus'
import IPFS_STATUS from '../enum/ipfsStatus'

export default {
  children: {},
  comments: {},
  texts: {},
  parents: {},
  ethAddress: null,
  ethereumUrl: '',
  ethereumStatus: ETHEREUM_STATUS.UNCHECKED,
  ipfsStatus: IPFS_STATUS.UNCHECKED,
  ipfsUrl: ''
}
