<template>
  <li v-if="!comment.moderated" class="comment" :class="{ pending: comment.status !== STATUS.SAVED, error: comment.status === STATUS.ERROR, moderated: comment.moderated }">
    <div class="comment-content">
      <div class="byline">
        
        <identicon class="identicon" :address="comment.author"></identicon>
        
        <a class="by" @mouseover="showDetails = true" @mouseout="showDetails = false">
          <a v-if="showDetails" :href="etherscanUrl" target="_blank" rel="noopener noreferrer">{{ authorName || comment.author }}</a>
          <a v-else>{{ authorName || comment.author }}</a>    
          •
        </a>

        <a class="by">
          <a v-if="comment.datePosted">{{ comment.datePosted | timeAgo }}</a>
          <a v-else>not published</a>
        </a>

        <a class="toggle" :class="{ open }">
          <a @click="open = !open">{{
            open
                ? '[-]'
                : '[+] collapsed'
          }}</a>
        </a>

        <a class="edited" v-if="comment.edited && open">
          *edited
        </a>

        <a v-if="comment.status !== STATUS.SAVED" class="by">
          <a class="status" v-if="comment.status === STATUS.PENDING_IPFS">saving text to IPFS</a>
          <a class="status" v-else-if="comment.status === STATUS.PENDING_APPROVAL">waiting for MetaMask approval</a>
          <a class="status" v-else-if="comment.status === STATUS.PENDING_TX">Waiting for block confirmation</a>
          <a class="error-status" v-else-if="comment.status === STATUS.ERROR">
            Rejected
            <button class="error-btn" @click="retryReply()">try again</button>
            |
            <button class="error-btn" @click="clearError({ id })">clear</button>
          </a>
        </a>
      
      </div>

      <div v-show="open">

        <div v-if="text && !editing">
          <vue-markdown class="text">{{ text }}</vue-markdown>
        </div>

        <div v-if="comment.status === STATUS.SAVED">
          <transition name="slide-fade">
            <div v-if="editing">
              <editor :id="id" ref="editingEditor" class="editingEditor" :autosave="false" :initialContent="text"></editor>
              <div class="md-btns">
                <button class="md-btn" @click="editing = false">Cancel</button>
                <button class="md-btn update" @click="update">Update</button>
              </div>
            </div>
          </transition>

          <div class="action-btns" v-if="!replying && !editing">
            <button class="action-btn" @click="replying = true">reply</button>
            <button class="action-btn" v-if="account == comment.author" @click="editing = true">edit</button>
            <button class="action-btn" v-if="account == comment.moderator && !comment.moderated" @click="moderate({ id, moderated: true })">moderate</button>
            <button class="action-btn" v-if="account == comment.moderator && comment.moderated" @click="moderate({ id, moderated: false })">unmoderate</button>
          </div>

          <transition name="slide-fade">
            <div v-if="replying">
              <editor ref="replyEditor" :id="id" :autosave="false"></editor>
              <div class="md-btns">
                <button class="md-btn" @click="replying = false">Cancel</button>
                <button class="md-btn reply" @click="reply">Reply</button>
              </div>
            </div>
          </transition>

          <ul class="comment-children">
            <comment v-for="id in children" :key="id" :id="id"></comment>
          </ul>

          <button v-if="canLoadMore" @click="fetchComments({id, numberToLoad: 30})">
            load more
          </button>
        </div>

      </div>
    </div>
  </li>
</template>

<script>
import { mapActions } from 'vuex'
import VueMarkdown from 'vue-markdown'

import Editor from './Editor'
import Identicon from './Identicon'
import { FETCH_COMMENTS, MODERATE_COMMENT, EDIT_COMMENT, REMOVE_COMMENT, FETCH_COMMENT } from '../store/types'
import STATUS from '../enum/status'

export default {
  name: 'comment',
  props: ['id'],
  components: {
    Editor,
    Identicon,
    VueMarkdown
  },
  data () {
    return {
      open: true,
      editing: false,
      replying: false,
      showDetails: false,
      STATUS
    }
  },
  computed: {
    comment () {
      return this.$store.state.comments[this.id]
    },
    authorName () {
      return this.$store.state.names[this.comment.author]
    },
    etherscanUrl () {
      return 'https://rinkeby.etherscan.io/address/' + this.comment.author
    },
    account () {
      return this.$store.state.account
    },
    children () {
      return this.$store.state.children[this.id] || []
    },
    text () {
      return this.$store.state.texts[this.id]
    },
    canLoadMore () {
      const canLoadChild = this.comment.child && !this.$store.state.comments[this.comment.child]
      const canLoadSibling = this.comment.sibling && !this.$store.state.comments[this.comment.sibling]
      return canLoadChild || canLoadSibling
    }
  },
  methods: {
    reply () {
      this.$refs.replyEditor.submitReply()
      this.replying = false
    },
    update () {
      this.$refs.editingEditor.submitEdit()
      this.editing = false
    },
    retryReply () {
      this.$store.dispatch(EDIT_COMMENT.type, {
        id: this.id,
        text: this.text
      })
    },
    clearError () {
      this.removeComment({ id: this.id, parent: this.$store.state.parents[this.id] })
      this.fetchComment({ id: this.id })
    },
    ...mapActions({
      'removeComment': REMOVE_COMMENT.type,
      'fetchComment': FETCH_COMMENT.type,
      'fetchComments': FETCH_COMMENTS.type,
      'moderate': MODERATE_COMMENT.type
    })
  }
}
</script>
<style lang="stylus">
fontSize = 1em

.pending
  background-color aliceblue
  color #828282
.error
  background-color #ffe8e8
.comment-children
  .comment-children
    margin-left 0.5em
.moderated
  // background-color red
.comment
  position relative
  border-left 1px solid #eee
  margin-top 1em
  .comment-content
    margin-left 1em
    .byline
      .identicon, .by, .toggle, .edited
        display inline-block
        vertical-align middle
        font-size (0.8 * fontSize)
        color #828282
      .identicon
        width 2em
      .by
        width fit-content
        a
          text-decoration none
        .error-status
          color black !important
          font-weight bold
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
      .toggle
        background-color #fffbf2
        padding .3em .3em
        border-radius 4px
        a
          cursor pointer
        &.open
          background-color transparent
      .edited
        font-style italic
    .text
      margin 0 0.3em
      overflow-wrap break-word
      font-size fontSize
      a:hover
        color #ff6600
    .slide-fade-enter-active 
      transition: all .3s ease
    .slide-fade-enter
      transform translateX(-10px)
      opacity 0
    .editingEditor
      margin-top 0.3em
    .md-btns
      text-align right
      .md-btn
        background none
        border none
        color #828282
        font-size (0.8 * fontSize)
        &:hover
          color black
          text-decoration underline
          cursor pointer
      .reply, .update
        color black
        text-decoration underline
    .action-btns
      .action-btn
        background none
        border none
        color #828282
        font-size (0.8 * fontSize)
        &:hover
          color black
          text-decoration underline
          cursor pointer
</style>

<style lang="stylus">
/* not scoped */
.comment
  .comment-content
    .text
      p
        margin 0.2em 0
</style>
