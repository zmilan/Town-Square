<template>
<modal name="settings-modal" @before-open="beforeOpen" transition="pop-out" :width="300" :height="400">
  <div class="container">
    <div class="input-field">
      Ethereum node url
      <div>
        <input type="text" v-model="ethereumUrl" class="input-box" :disabled="usingMetaMask">
      </div>
      <div v-if="usingMetaMask" class="mm-msg">
        * already connected via MetaMask
      </div>
    </div>
    <div class="input-field">
      IPFS gateway
      <div>
        <input type="text" v-model="ipfsUrl" class="input-box">
      </div>
    </div>
    <button @click="apply">apply</button>
  </div>
</modal>
</template>
<script>
import { UPDATE_ETHEREUM_CONNECTION, UPDATE_IPFS_CONNECTION } from '../../store/types'

export default {
  name: 'settingsModal',
  props: [],
  data () {
    return {
      usingMetaMask: false,
      ethereumUrl: '',
      ipfsUrl: ''
    }
  },
  methods: {
    beforeOpen (event) {
      if (typeof window.web3 !== 'undefined') {
        this.usingMetaMask = true
      } else {
        this.ethereumUrl = this.$store.state.ethereumUrl
      }
      this.ipfsUrl = this.$store.state.ipfsUrl
    },
    apply () {
      if (!this.usingMetaMask) {
        this.$store.dispatch(UPDATE_ETHEREUM_CONNECTION, {
          url: this.ethereumUrl
        })
      }
      this.$store.dispatch(UPDATE_IPFS_CONNECTION, {
        url: this.ipfsUrl
      })
      this.$modal.hide('settings-modal')
    }
  }
}
</script>

<style lang="stylus" scoped>
.container
  margin 3em
  text-align center
  align center
  .input-field
    width 10em
    text-align center
    display block
    margin 2em auto
    text-align left
    .input-box
      width 100%
    .mm-msg
      font-size 0.7em
      color #777
  button
    background none
    border none
    &:hover
      color black
      text-decoration underline
      cursor pointer
</style>
