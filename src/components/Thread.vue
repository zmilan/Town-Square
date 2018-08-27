<template>
  <div class="item-view">
    <template v-if="rootComment">
      <div class="item-view-header">
        <div class="title-block">
          <!-- TODO, make text a component -->
          <div v-if="text && text.value">
            <vue-markdown :source="text.value" class="text" :html="false"></vue-markdown>
          </div>

          <div class="byline">

            <identicon class="identicon" :address="rootComment.author"></identicon>

            <a class="by" @mouseover="showDetails = true" @mouseout="showDetails = false">
              <a class="by" v-if="showDetails" :href="etherscanUrl" target="_blank" rel="noopener noreferrer">{{ rootComment.author }}</a>
              <a class="by" v-else>{{ rootComment.author | truncate }}</a>   
              •
            </a>
            <a class="by">{{ rootComment.datePosted | timeAgo }}</a>
            <a v-if="this.$config.ipfsHash" class="by">
              •
              <a :href="ipfsUrl" target="_blank" class="ipfs-hash">&#8599; ipfs</a>
            </a>
          </div>
        </div>
      </div>

      <div v-if="ethAddress">
        <editor :id="id" ref="editor" :autosave="false" :placeholder="$config.editorPlaceholderTop"></editor>
        <button class="add-comment-btn" @click="publishComment">💬 publish reply</button>
      </div>
      <div v-else class="metamask">
        Log in to <a href="https://metamask.io/" target="_blank">MetaMask</a> to add a comment
      </div>
      <hr class="divider">

      <div class="item-view-comments">
        <!-- <p class="item-view-comments-header">
          <spinner :show="loading" class="spinner"></spinner>
        </p> -->
        <ul v-if="rootComment.child" class="comment-children">
          <comment v-for="id in children" :key="id" :id="id" :depth="1"></comment>
        </ul>
        <div v-if="!rootComment.child" class="no-comments-container">
          <div class="no-comments-msg">Be the first to comment 🐵</div>
        </div>
      </div>
    </template>
  </div>
</template>

<script>
import { mapActions } from 'vuex'
import VueMarkdown from 'vue-markdown'

import Comment from './Comment'
import Editor from './Editor'
import Identicon from './Identicon'
import Spinner from './Spinner'
import { FETCH_COMMENT, FETCH_COMMENTS } from '../store/types'

export default {
  name: 'thread',
  props: ['id'],
  components: {
    Comment,
    Editor,
    Identicon,
    Spinner,
    VueMarkdown
  },
  data: () => ({
    showDetails: false
  }),
  computed: {
    children () {
      return this.$store.state.children[this.id] || []
    },
    ethAddress () {
      return this.$store.state.ethAddress
    },
    etherscanUrl () {
      const network = process.env.NODE_ENV === 'production' ? '' : 'rinkeby.'
      return `https://${network}etherscan.io/address/${this.rootComment.author}`
    },
    rootComment () {
      return this.$store.state.comments[this.id]
    },
    text () {
      return this.$store.state.texts[this.id]
    },
    ipfsUrl () {
      return `https://gateway.ipfs.io/ipfs/${this.$config.ipfsHash}/#/thread/${this.id}`
    }
  },
  beforeMount () {
    this.loadThread()
  },
  methods: {
    publishComment () {
      this.$refs.editor.submitComment()
    },
    ...mapActions({
      'fetchComment': FETCH_COMMENT,
      'fetchComments': FETCH_COMMENTS
    }),
    loadThread () {
      this.fetchComment({id: this.id}).then(() => {
        if (this.rootComment && this.rootComment.child) {
          // Now start load the other comments
          this.fetchComments({
            id: this.rootComment.child,
            numberToLoad: 15,
            depth: Math.min(this.$config.depthLimit - 1, 3)
          })
        }
      })
    }
  },
  watch: {
    id: function () {
      this.loadThread()
    }
  }
}

</script>

<style lang="stylus" scoped>
.item-view-header
  background-color #fff
  display flex
  flex-direction row
  .title-block
    margin: 0 0 0.5em 0.5em
    .text
      font-size 1.1em
      overflow-wrap break-word
    .byline
      font-size 0.8em
      color #828282
      .identicon
        width: 2em
      .identicon, .by
        display inline-block
        vertical-align middle
      .by
        color #828282
        width fit-content
        a
          text-decoration none
        .ipfs-hash
          color #828282
          &:hover
            color black
            text-decoration underline
            cursor pointer
.add-comment-btn
  background none
  border 2px solid
  color #444
  margin 1em
  &:hover
    color black
    cursor pointer
.metamask
  margin 1em
.item-view-comments
  background-color #fff
  margin-top 1px
  .no-comments-container
    height 100px
    position relative
    .no-comments-msg
      position absolute
      top 50%
      left 50%
      transform translateX(-50%) translateY(-50%)
      white-space nowrap
.item-view-comments-header
  margin 0
  font-size 1.1em
  padding 0.2em 0
  position relative
  .spinner
    display inline-block
    margin -15px 0
    width 100%
.divider
  border 0
  height 1px
  background #ddd
@media (max-width 700px)
  .item-view-header
    h1
      font-size 1.25em
</style>

<style lang="stylus">
/* not scoped */
.comment-children
  list-style-type none
  padding 0
  margin 0
.item-view-header
  .title-block
    .text
      p
        margin 0.2em 0
</style>

<style>
  @import '~simplemde/dist/simplemde.min.css';
</style>
