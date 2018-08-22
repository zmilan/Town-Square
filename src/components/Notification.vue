<template>
  <notifications :group="group" position="top right" animation-name="v-fade-right">
    <template slot="body" slot-scope="props">
    <div class="custom-template" :class="'notification-' + props.item.type">
      <div class="custom-template-content">
        <div class="custom-template-title">
          {{props.item.title}}
        </div>
        <div class="custom-template-text"
          v-html="props.item.text">
        </div>
          <button class="action-btn" @click="retry">retry</button>
          <button class="action-btn" @click="$modal.show('settings-modal')">settings</button>
      </div>
    </div>
  </template>
</notifications>

</template>

<script>
import { mapActions } from 'vuex'
import { UPDATE_ETHEREUM_CONNECTION, UPDATE_IPFS_CONNECTION } from '../store/types'

export default {
  props: ['group'],
  computed: {
    ethereumUrl () {
      return this.$store.state.ethereumUrl
    },
    ipfsUrl () {
      return this.$store.state.ipfsUrl
    }
  },
  methods: {
    retry () {
      if (this.group === 'ipfs-notification') {
        this.updateIpfsConnection({url: this.ipfsUrl})
      } else if (this.group === 'ethereum-notification') {
        this.updateEthereumConnection({url: this.ethereumUrl})
      }
    },
    ...mapActions({
      'updateEthereumConnection': UPDATE_ETHEREUM_CONNECTION,
      'updateIpfsConnection': UPDATE_IPFS_CONNECTION
    })
  }
}
</script>

<style lang="stylus">
.notifications
  z-index 500
.notification-warn
  background #ffb648
.notification-error
  background #E54D42
.custom-template
  text-align center
  margin 1em
  margin-bottom 0
  background
  border 2px solid #D0F2E1
  .custom-template-content
    padding 10px
    .action-btn
      background none
      border none
      &:hover
        color black
        text-decoration underline
        cursor pointer
.v-fade-right-enter-active, .v-fade-right-leave-active, .v-fade-right-move
  transition all .5s
.v-fade-right-enter, .v-fade-right-leave-to 
  opacity 0
  transform translateX(500px) scale(0.2)
</style>
