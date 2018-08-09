<template>
<modal name="register-name-modal" transition="pop-out" :width="modalWidth" :height="400">
  <textarea v-model="content" class="editor"></textarea>
  
  <button @click="submit">Submit</button>
</modal>
</template>
<script>
import { REGISTER_NAME } from '../../store/types'

const MODAL_WIDTH = 656
export default {
  name: 'RegisterNameModal',
  data () {
    return {
      modalWidth: MODAL_WIDTH,
      content: ''
    }
  },
  created () {
    this.modalWidth = window.innerWidth < MODAL_WIDTH
      ? MODAL_WIDTH / 2
      : MODAL_WIDTH
  },
  methods: {
    submit () {
      console.log(this.content, '======')
      this.$store.dispatch(REGISTER_NAME.type, {
        text: this.content
      })
    }
  }
}
</script>
