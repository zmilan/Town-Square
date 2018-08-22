<template>
<div>
  <about-modal />
  <create-thread-modal />
  <settings-modal />
  <notification group="ipfs-notification"/>
  <notification group="ethereum-notification"/>
  
  <Thread :id="threadId" v-if="connected"/>

  <hr class="divider">

  <div>
    <span>
      <button class="logo footer-btn" @click="$modal.show('about-modal')">
        ⛲ How does this work?
      </button>
      |
      <button class="footer-btn" @click="$modal.show('create-thread-modal')">
        🌳 add Town Square to your site
      </button>
      |
      <button class="footer-btn" @click="$modal.show('settings-modal')">
        ⚙️ settings
      </button>
    </span>
    <div class="footer-right">
      <button class="footer-btn footer-btn-right">
        version {{version}}
      </button>
    </div>
  </div>
</div>
</template>

<script>
import debounce from 'lodash.debounce'
import throttle from 'lodash.throttle'
import { mapActions } from 'vuex'

import Thread from './components/Thread'
import ETHEREUM_STATUS from './enum/ethereumStatus'
import IPFS_STATUS from './enum/ipfsStatus'
import AboutModal from './components/modals/About-Modal'
import CreateThreadModal from './components/modals/Create-Thread-Modal'
import Emitter from './util/emitter'
import Notification from './components/Notification'
import SettingsModal from './components/modals/Settings-Modal'
import Spinner from './components/Spinner'
import { SWITCH_THREAD, UPDATE_ETH_ADDRESS, UPDATE_ETHEREUM_CONNECTION, UPDATE_IPFS_CONNECTION } from './store/types'

export default {
  name: 'app',
  components: {
    Thread,
    AboutModal,
    CreateThreadModal,
    Notification,
    SettingsModal,
    Spinner
  },
  data: () => ({
    IPFS_STATUS,
    version: process.env.version
  }),
  computed: {
    connected () {
      const ethConnected = this.$store.state.ethereumStatus === ETHEREUM_STATUS.SUCCESS
      const ipfsConnected = this.$store.state.ipfsStatus === IPFS_STATUS.SUCCESS
      return ethConnected && ipfsConnected
    },
    threadId () {
      return this.$store.state.threadId
    }
  },
  beforeMount () {
    // register metamask event listeners
    Emitter.on('Metamask-Update', debounce(function (details) {
      if (details) {
        this.updateEthAddress({ address: details.selectedAddress })
      }
    }.bind(this)), 1000)

    this.switchThread({ id: this.$config.threadId })
    this.updateEthereumConnection({url: this.$config.ethereumUrl})
    this.updateIpfsConnection({url: this.$config.ipfsUrl})
  },
  methods: {
    ...mapActions({
      'switchThread': SWITCH_THREAD,
      'updateEthAddress': UPDATE_ETH_ADDRESS,
      'updateEthereumConnection': UPDATE_ETHEREUM_CONNECTION,
      'updateIpfsConnection': UPDATE_IPFS_CONNECTION
    })
  },
  watch: {
    '$store.state.ipfsStatus': throttle(function (status) {
      this.$notify({
        group: 'ipfs-notification',
        clean: true
      })
      if (status === IPFS_STATUS.ERROR) {
        this.$notify({
          group: 'ipfs-notification',
          title: '😿 can\'t connect to IPFS',
          text: 'gateway: ' + this.$store.state.ipfsUrl,
          type: 'error',
          duration: -1
        })
      } else if (status === IPFS_STATUS.STILL_CHECKING) {
        this.$notify({
          group: 'ipfs-notification',
          title: 'It\'s taking longer than normal to connect to IPFS...',
          type: 'warn',
          duration: -1
        })
      }
    }, 1000),
    '$store.state.ethereumStatus': throttle(function (status) {
      this.$notify({
        group: 'ethereum-notification',
        clean: true
      })
      if (status === ETHEREUM_STATUS.ERROR) {
        let msg = ''
        if (typeof window.web3 === 'undefined') {
          msg += ' trying to connect to node: ' + this.$store.state.ethereumUrl
        }

        if (process.env.NODE_ENV === 'development') {
          msg += ' make sure you are connected to the Rinkeby network (development)'
        } else {
          msg += ' make sure you are connected to the mainnet'
        }

        this.$notify({
          group: 'ethereum-notification',
          title: '😿 can\'t connect to Ethereum network',
          text: msg,
          type: 'error',
          duration: -1
        })
      }
    }, 1000)
  }
}
</script>

<style lang="stylus" scoped>
.footer-btn
  font-size 0.8em
  background none
  border none
  color #828282
  &:hover
    color black
    text-decoration underline
    cursor pointer
.footer-right
  float right
.footer-btn-right
  color #ddd
@media (max-width 700px)
  .item-view-header
    h1
      font-size 1.25em
  .footer-right
    float none
</style>
