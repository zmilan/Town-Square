<template>
  <li class="comment" :class="{ pending: comment.status !== COMMENT_STATUS.SAVED, error: (comment.status === COMMENT_STATUS.ERROR) }">
    <div class="comment-content">
      <!-- TODO make byline a component -->
      <div class="byline">
        
        <identicon class="identicon" :address="comment.author"></identicon>
        
        <a class="by" @mouseover="showDetails = true" @mouseout="showDetails = false">
          <a class="by" v-if="showDetails" :href="etherscanUrl" target="_blank" rel="noopener noreferrer">{{ comment.author }}</a>
          <a class="by" v-else>{{ comment.author | truncate }}</a>    
          •
        </a>

        <a class="by">
          <a v-if="comment.datePosted">{{ comment.datePosted | timeAgo }}</a>
          <a v-else>not published</a>
        </a>

        <a class="toggle" :class="{ open }">
          <a @click="open = !open">
            {{open
              ? '[-]'
              : '[+] collapsed'}}
          </a>
        </a>

        <a v-if="comment.status !== COMMENT_STATUS.SAVED" class="by">
          <a class="status" v-if="comment.status === COMMENT_STATUS.PENDING_IPFS">saving text to IPFS</a>
          <a class="status" v-else-if="comment.status === COMMENT_STATUS.PENDING_APPROVAL">waiting for MetaMask approval</a>
          <a class="status" v-else-if="comment.status === COMMENT_STATUS.PENDING_TX">Waiting for block confirmation</a>
          <a class="error-status" v-else-if="comment.status === COMMENT_STATUS.ERROR">
            Rejected - 
            {{comment.errorMsg}}
            <button class="error-btn" @click="retryReply()">try again</button>
            |
            <button class="error-btn" @click="clearError({ id })">cancel</button>
          </a>
        </a>
      
      </div>

      <div v-show="open">

        <div v-if="text">
          <vue-markdown v-if="text.status === TEXT_STATUS.SUCCESS && text.value" :source="text.value" class="text" :html="false"></vue-markdown>
          
          <div v-else-if="text.status === TEXT_STATUS.FETCHING" class="status text-status">
            <spinner show="true" style="spinner"></spinner>
            retrieving content from IPFS
          </div>
          <div v-else-if="text.status === TEXT_STATUS.ERROR" class="text-status">
            couldn't retrieve content from IPFS: {{text.errorMsg}}
            <button class="action-btn" @click="fetchText({ id })">
              [retry]
            </button>
          </div>
        </div>

        <div v-if="comment.status === COMMENT_STATUS.SAVED">
          <div v-if="!replying">
            <span v-if="depth < depthLimit - 1">
              <span v-if="ethAddress">
                <button class="action-btn" 
                  @click="replying = true">
                  💬 reply
                </button>
              </span>
            </span>
            <span v-else>
              <router-link class="action-btn" :to="`/thread/${id}`">
                {{ comment.child ? 'view comments' : '0 comments' }}
              </router-link>
            </span>
            <span v-if="$config.ipfsHash">
              <a :href="ipfsUrl" target="_blank" class="action-btn">↗ ipfs</a>
            </span>
          </div>

          <transition name="slide-fade">
            <div v-if="replying">
              <div class="byline replying-as">
                
                <a class="by">replying as:</a>
                <identicon class="identicon" :address="ethAddress"></identicon>

                <a class="by">
                  <a>{{ ethAddress | truncate }}</a>
                </a>
              </div>

              <editor ref="editor" :id="id" :autosave="false" :placeholder="$config.editorPlaceholder"></editor>
              <div class="md-btns">
                <button class="md-btn" @click="replying = false">Cancel</button>
                <button class="md-btn reply" @click="reply">💬 Reply</button>
              </div>
            </div>
          </transition>

          <ul class="comment-children" v-if="depth < depthLimit">
            <comment v-for="id in children" :key="id" :id="id" :depth="depth + 1"></comment>
          </ul>

          <button v-if="canLoadSibling" class="md-btn" @click="fetchComments({id: comment.sibling, numberToLoad: 15, depth: 3})">
            load more <a class="arrow">⬇</a>
          </button>
          <button v-if="canLoadChild" class="md-btn" @click="fetchComments({id: comment.child, numberToLoad: 15, depth: 3})">
            load more <a class="arrow">⬊</a>
          </button>
        </div>

      </div>
    </div>
  </li>
</template>

<script>
import { mapActions } from 'vuex'
import VueMarkdown from 'vue-markdown'

import COMMENT_STATUS from '../enum/commentStatus'
import Editor from './Editor'
import Identicon from './Identicon'
import Spinner from './Spinner'
import { FETCH_COMMENTS, REMOVE_COMMENT, FETCH_COMMENT, FETCH_TEXT, SWITCH_THREAD, PUBLISH_COMMENT } from '../store/types'
import TEXT_STATUS from '../enum/textStatus'

export default {
  name: 'comment',
  props: ['id', 'depth'],
  components: {
    Editor,
    Identicon,
    Spinner,
    VueMarkdown
  },
  data () {
    return {
      open: true,
      replying: false,
      showDetails: false,
      COMMENT_STATUS,
      TEXT_STATUS
    }
  },
  computed: {
    comment () {
      return this.$store.state.comments[this.id]
    },
    etherscanUrl () {
      const network = process.env.NODE_ENV === 'production' ? '' : 'rinkeby.'
      return `https://${network}etherscan.io/address/${this.comment.author}`
    },
    ethAddress () {
      return this.$store.state.ethAddress
    },
    children () {
      return this.$store.state.children[this.id] || []
    },
    depthLimit () {
      if (this.$store.state.threadId === this.$store.state.initialThreadId) {
        return this.$config.depthLimit
      } else {
        return 10
      }
    },
    text () {
      return this.$store.state.texts[this.id]
    },
    canLoadChild () {
      return this.comment.child && !this.$store.state.comments[this.comment.child] && this.depth < this.depthLimit
    },
    canLoadSibling () {
      return this.comment.sibling && !this.$store.state.comments[this.comment.sibling]
    },
    ipfsUrl () {
      return `https://gateway.ipfs.io/ipfs/${this.$config.ipfsHash}/#/thread/${this.id}`
    }
  },
  methods: {
    reply () {
      this.$refs.editor.submitComment()
      this.replying = false
    },
    retryReply () {
      const parent = this.$store.state.parents[this.id]
      const text = this.text.value
      this.removeComment({ parent, id: this.id })
      this.publishComment({ parent, text })
    },
    clearError () {
      this.removeComment({ parent: this.$store.state.parents[this.id], id: this.id })
    },
    viewComment () {
      if (this.$config.moreCommentHref) {

      } else {
        this.switchThread({ id: this.id })
      }
    },
    ...mapActions({
      'removeComment': REMOVE_COMMENT,
      'fetchComment': FETCH_COMMENT,
      'fetchComments': FETCH_COMMENTS,
      'fetchText': FETCH_TEXT,
      'switchThread': SWITCH_THREAD,
      'publishComment': PUBLISH_COMMENT
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
  background-color #ffddda
.comment-children
  .comment-children
    margin-left 0.5em
.md-btn
  background none
  border none
  color #828282
  font-size (0.8 * fontSize)
  &:hover
    color black
    text-decoration underline
    cursor pointer
.comment
  position relative
  border-left 1px solid #eee
  margin-top 1em
  .comment-content
    margin-left 1em
    .arrow
      font-size 1.5em
      position relative
      top: 0.3em
    .replying-as
      width 100%
      text-align right
    .status
      color black
      font-weight bold
    .status:after
      overflow hidden
      display inline-block
      vertical-align bottom
      -webkit-animation ellipsis steps(4,end) 900ms infinite 
      animation ellipsis steps(4,end) 900ms infinite
      content "\2026" /* ascii code for the ellipsis character */
      width 0px
    .byline
      .identicon, .by, .toggle
        display inline-block
        vertical-align middle
        font-size (0.9 * fontSize)
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
    .text
      margin 0 0.3em
      overflow-wrap break-word
      font-size fontSize
      a:hover
        color #ff6600
    .text-status
      color #828282
      font-style italic
      font-size (0.8 * fontSize)
      margin-left 1em
    .spinner
      width 1.3em
      height 1.3em
      margin-left 2em
    .slide-fade-enter-active 
      transition: all .3s ease
    .slide-fade-enter
      transform translateX(-10px)
      opacity 0
    .md-btns
      text-align right
      .reply, .update
        color black
        text-decoration underline
    .action-btn
      background none
      border none
      color #828282
      font-size (0.8 * fontSize)
      margin 0.4em
      text-decoration none
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
