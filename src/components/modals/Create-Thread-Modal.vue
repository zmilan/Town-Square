<template>
<modal name="create-thread-modal" transition="pop-out" :width="modalWidth" :height="500">
  <div class="container">
    <button class="btn close" @click="close()">[X]</button>
    <h5> Make a new Town Square thread </h5>
    <div v-if="pendingThread">
      <div class="commentContainer">
        <Comment :id="pendingThreadId" :depth="0"></comment>
      </div>
      <div v-if="pendingThread.datePosted">
        <div>Your thread's id is <span class="threadId">{{pendingThreadId}}</span></div>
        <br>
        Use this snippet to embed your thread 
        <button @click="copyText" class="btn">{{copySymbol}} copy</button>
        <textarea type="text" :value="htmlSnippet" class="htmlSnippet" ref="htmlSnippet" readonly>
        </textarea>
      </div>
    </div>
    <div v-else>
      Town Square is so decentralized it doesn't even have a homepage. It lives on many sites in 
      threads can be embedded on your site
      <div v-if="$store.state.ethAddress">
        <div class="editorContainer">
          <editor :id="0" ref="editor" class="editor" :autosave="false" :placeholder="placeholder"></editor>
        </div>
        <button class="btn" @click="submit">Submit</button>
      </div>
      <div v-else>
        <br>
        You must log with <a href="https://metamask.io/" target="_blank">MetaMask</a> to create a thread
      </div>
    </div>
  </div>
</modal>
</template>

<script>
import { mapActions } from 'vuex'

import Comment from '../Comment'
import Editor from '../Editor'
import { REMOVE_PENDING_THREAD } from '../../store/types'

export default {
  name: 'CreateThreadModal',
  components: {
    Comment,
    Editor
  },
  data () {
    return {
      modalWidth: 600,
      placeholder: 'This text will appear at the top of your thread (optional)',
      copySymbol: `📋`
    }
  },
  computed: {
    pendingThread () {
      return this.$store.state.comments[this.pendingThreadId]
    },
    pendingThreadId () {
      return this.$store.state.pendingThreadId
    },
    htmlSnippet () {
      return '\n' +
      '<div id="my-town-square"></div>\n' +
      '<script\n' +
      '  src="https://cdn.rawgit.com/WillWhiteneck/ether-comments/master/src/config.js?token=AF0DkARvUKi4SosQiaNbh6VzASw41zM7ks5bhYndwA%3D%3D"\n' +
      '  data-thread-id="' + this.pendingThreadId + '"\n' +
      '  data-container-id="my-town-square">' +
      '<' + '/script>\n'
    }
  },
  created () {
    this.modalWidth = window.innerWidth < this.modalWidth
      ? window.innerWidth
      : this.modalWidth
  },
  methods: {
    close () {
      this.removePendingThread()
      this.$modal.hide('create-thread-modal')
    },
    copyText () {
      const textBox = this.$refs.htmlSnippet
      textBox.select()
      document.execCommand('copy')
      this.copySymbol = `✔`
    },
    submit () {
      this.$refs.editor.submitComment()
    },
    ...mapActions({
      'removePendingThread': REMOVE_PENDING_THREAD
    })
  }
}
</script>
<style lang="stylus" scoped>
.container
  margin 1.5em
  text-align center
  align center
  .close
    align right
  .commentContainer
    text-align left
    height 7em
    overflow hidden auto
    border solid black 2px
  .editorContainer
    max-height 300px
    overflow hidden auto
    .editor
      text-align left
      margin 20px
  .threadId
    margin 0 0.2em
    text-decoration underline
    background-color #fffbf2
    font-size 1.5em
  .htmlSnippet
    width 90%
    height 7em
    overflow hidden auto
    resize none
  .btn
    background none
    border none
    color #828282
    &:hover
      color black
      text-decoration underline
      cursor pointer
</style>
