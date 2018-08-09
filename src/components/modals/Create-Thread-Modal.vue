<template>
<modal name="create-thread-modal" transition="pop-out" :width="modalWidth" :height="400">
  <editor :id="0" ref="editor" class="editor" :autosave="false" :placeholder="placeholder"></editor>
  
  <input type="radio" id="self" value="self" v-model="modType">
  <label for="self">I'll be moderator</label>
  <br>
  <input type="radio" id="friend" value="friend" v-model="modType">
  <label for="friend">My friend will moderate</label>
  <br>
  <input type="radio" id="none" value="none" v-model="modType">
  <label for="none">Let's not moderate (not recommended)</label>

  <button @click="submit">Submit</button>
</modal>
</template>
<script>
import Editor from '../Editor'

const MODAL_WIDTH = 656
export default {
  name: 'CreateThreadModal',
  components: {
    Editor
  },
  data () {
    return {
      modalWidth: MODAL_WIDTH,
      placeholder: 'A title for your thread (optional)',
      modType: 'self'
    }
  },
  created () {
    this.modalWidth = window.innerWidth < MODAL_WIDTH
      ? MODAL_WIDTH / 2
      : MODAL_WIDTH
  },
  methods: {
    submit () {
      let moderator
      if (this.modType === 'self') {
        moderator = this.$store.state.account
      } else if (this.modType === 'friend') {
        //
      } else {
        moderator = '0x0000000000000000000000000000000000000000'
      }
      console.log('MOD', moderator)
      this.$refs.editor.submitThread(moderator)
    }
  }
}
</script>
