<template>
  <li class="comment pending" :class="{ error: status === STATUS.ERROR }">
    <div class="comment-content">
      <div class="byline">
        
        <identicon class="identicon" :address="author"></identicon>
        
        <a class="by">
          <a>{{ authorName || author }}</a>    
          •
        </a>

        <a class="by">
          <a>not published</a>
          •
        </a>

        <a class="by">
          <a class="status" v-if="status === STATUS.PENDING_IPFS">saving text to IPFS</a>
          <a class="status" v-else-if="status === STATUS.PENDING_APPROVAL">waiting for MetaMask approval</a>
          <a class="status" v-else-if="status === STATUS.PENDING_TX">Waiting for block confirmation</a>
          <a class="error-btn" v-else-if="status === STATUS.ERROR">
            Rejected
            <button class="error-btn" @click="retrySubmit()">try again</button>
            |
            <button class="error-btn" @click="removePendingComment()">clear</button>
          </a>
        </a>
      </div>

      <div v-if="text">
        <vue-markdown v-once class="text pending-text">{{ text }}</vue-markdown>
      </div>

    </div>
  </li>
</template>

<script>
import VueMarkdown from 'vue-markdown'

import { ADD_COMMENT, REMOVE_PENDING_COMMMENT } from '../store/types'
import Identicon from './Identicon'
import STATUS from '../enum/status'

export default {
  name: 'pendingComment',
  props: ['id'],
  components: {
    Identicon,
    VueMarkdown
  },
  data () {
    return {
      STATUS
    }
  },
  computed: {
    status () {
      return this.$store.state.pendingComments[this.id].status
    },
    author () {
      return this.$store.state.pendingComments[this.id].author
    },
    text () {
      return this.$store.state.pendingComments[this.id].text
    },
    retrySubmit () {
      this.$store.dispatch(ADD_COMMENT.type, {
        parent: this.$store.state.pendingComments[this.id].parent,
        text: this.text
      })
      this.removePendingComment()
    },
    removePendingComment () {
      this.$store.dispatch(REMOVE_PENDING_COMMMENT.type, {
        id: this.id
      })
    },
    authorName () {
      return this.$store.state.names[this.author]
    }
  }
}
</script>

<style lang="stylus" scoped>
.pending
  background-color aliceblue
  color #828282
.error
  background-color #ffe8e8
.error-btn
  color black !important
  font-weight bold
  background none
  border none
  &:hover
    color black
    text-decoration underline
    cursor pointer
.status
  color black !important
  font-weight bold
.status:after
  overflow hidden
  display inline-block
  vertical-align bottom
  -webkit-animation ellipsis steps(4,end) 900ms infinite 
  animation ellipsis steps(4,end) 900ms infinite
  content "\2026" /* ascii code for the ellipsis character */
  width 0px
@keyframes ellipsis
  to
    width 1.25em
@-webkit-keyframes ellipsis
  to
    width 1.25em
</style>
