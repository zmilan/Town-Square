import debounce from 'lodash.debounce'

import store from './store'
import Emitter from './util/emitter'
import { UPDATE_ETH_ADDRESS } from './store/types'

// register metamask event listener
Emitter.on('Metamask-Update', debounce(function (details) {
  if (details) {
    store.dispatch(UPDATE_ETH_ADDRESS, { address: details.selectedAddress })
  }
}), 1000)
