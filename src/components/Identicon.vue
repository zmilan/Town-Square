<template>
  <img class="identicon" :src="identicon">
</template>

<script>
import Identicon from 'identicon.js'
export default {
  name: 'identicon',
  props: ['address'],
  computed: {
    identicon () {
      const hash = this.address
      const options = {
        margin: 0.2,
        size: 100,
        format: 'svg'
      }

      const data = new Identicon(hash, options).toString()
      return 'data:image/svg+xml;base64,' + data
    }
  }
}
</script>

<style lang="stylus" scoped>
.identicon
  border-top-left-radius 50% 50%
  border-top-right-radius 50% 50%
  border-bottom-right-radius 50% 50%
  border-bottom-left-radius 50% 50%
</style>
