<template>
<modal name="settings-modal" transition="pop-out" :width="modalWidth" :height="400">
  <div class="container">
    <div class="input-field">
      * IPFS gateway
      <div>
        <input type="text" v-model="ipfsUrl" class="input-box">
      </div>
    </div>
    <div class="input-field">
      * Ethereum node url
      <div>
        <input type="text" v-model="ethereumHost" class="input-box">
      </div>
    </div>
    <button @click="apply">apply</button>
  </div>
</modal>
</template>
<script>
import { UPDATE_IPFS_CONNECTION } from '../../store/types'

const MODAL_WIDTH = 656
export default {
  name: 'settingsModal',
  props: ['initialIpfsUrl'],
  data () {
    return {
      modalWidth: MODAL_WIDTH,
      ethereumHost: '',
      ipfsUrl: ''
    }
  },
  beforeMount () {
    this.ipfsUrl = this.initialIpfsUrl
  },
  created () {
    this.modalWidth = window.innerWidth < MODAL_WIDTH
      ? MODAL_WIDTH / 2
      : MODAL_WIDTH
  },
  methods: {
    apply () {
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
  width 80%
  margin 3em
  text-align center
  .input-field
    margin 3em
    width 10em
    text-align center
    color red
    .input-box
      width 100%
</style>
