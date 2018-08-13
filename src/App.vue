<template>
  <div class="item-view" v-if="rootComment">
    
    <about-pigeon-modal />
    <create-thread-modal />
    <register-name-modal />

    <template v-if="rootComment">
      <div class="item-view-header">
        <identicon :address="rootComment.author" class="identicon"></identicon>
        
        <div class="title-block">
          <div v-if="text && text.value">
            <vue-markdown v-once class="text">{{ text.value }}</vue-markdown>
          </div>

          <div class="byline">
            <a class="byline-el" @mouseover="showDetails = true" @mouseout="showDetails = false">
              <a>{{ authorName || rootComment.author }}</a>    
              •
            </a>
            <a class="byline-el">
              <a>{{ rootComment.datePosted | timeAgo }}</a>
              •
            </a>
            <a class="byline-el">
              <a>mod: {{ moderatorName || rootComment.moderator }}</a>
            </a>
          </div>        
        </div>
      </div>

      <editor :id="rootComment.id" ref="replyEditor" :autosave="false"></editor>
      <button class="add-comment-btn" @click="addComment">add comment</button>

      <hr class="divider">

      <div class="item-view-comments">
        <p class="item-view-comments-header">
          {{ children.length ? '' : 'No comments yet.' }}
          <spinner :show="loading"></spinner>
        </p>
        <ul v-if="!loading && rootComment.child" class="comment-children">
          <comment v-for="id in children" :key="id" :id="id"></comment>
        </ul>
        <div v-if="!loading && !rootComment.child" class="no-comments-container">
          <div class="no-comments-msg">Be the first to comment 🕊️</div>
        </div>
      </div>

      <hr class="divider">

      <div>
        <span>
          <button class="logo footer-btn" @click="$modal.show('about-pigeon-modal')">
            🕊️pigeon
          </button>
          |
          <button class="footer-btn" @click="$modal.show('create-thread-modal')">
            add pigeon to your site
          </button>
          |
          <button class="footer-btn" @click="$modal.show('register-name-modal')">
            register your name
          </button>
        </span>
        <div class="footer-right">
          <button class="footer-btn footer-btn-right">
            version {{version}}
          </button>
        </div>
      </div>
    </template>
  </div>
</template>

<script>
import { mapActions } from 'vuex'
import VueMarkdown from 'vue-markdown'

import AboutPigeonModal from './components/modals/About-Pigeon-Modal'
import Comment from './components/Comment'
import CreateThreadModal from './components/modals/Create-Thread-Modal'
import Editor from './components/Editor'
import Identicon from './components/Identicon'
import RegisterNameModal from './components/modals/Register-Name-Modal'
import Spinner from './components/Spinner'
import { FETCH_COMMENTS, FETCH_ETH_ADDRESS } from './store/types'

export default {
  name: 'app',
  components: {
    AboutPigeonModal,
    Comment,
    CreateThreadModal,
    Editor,
    Identicon,
    RegisterNameModal,
    Spinner,
    VueMarkdown
  },
  data: () => ({
    loading: false,
    showDetails: false
  }),
  computed: {
    rootComment () {
      return this.$store.state.comments[this.$store.state.rootCommentId]
    },
    authorName () {
      return this.$store.state.names[this.rootComment.author]
    },
    moderatorName () {
      return this.$store.state.names[this.rootComment.moderator]
    },
    children () {
      return this.$store.state.children[this.$store.state.rootCommentId] || []
    },
    text () {
      return this.$store.state.texts[this.$store.state.rootCommentId]
    },
    version () {
      return process.env.version
    }
  },
  beforeMount () {
    this.$store.dispatch(FETCH_ETH_ADDRESS)
    this.fetchComments({
      id: this.$store.state.rootCommentId,
      numberToLoad: 5
    })
  },
  methods: {
    addComment () {
      this.$refs.replyEditor.submitReply()
    },
    ...mapActions({
      'fetchComments': FETCH_COMMENTS
    })
  }
}

</script>

<style lang="stylus" scoped>
.item-view-header
  background-color #fff
  display flex
  flex-direction row
  .identicon
    flex: 0 0 2em
    height 2em
    vertical-align top
    float left
  .title-block
    flex 1
    margin: 0 0 0.5em 0.5em
    .text
      font-size 1.1em
      overflow-wrap break-word
    .byline
      font-size 0.8em
      color #828282
.add-comment-btn
  background none
  border 2px solid
  color #444
  margin 1em
  &:hover
    color black
    cursor pointer
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
.divider
  border 0
  height 1px
  background #ddd
.logo
  font-size 1.25em
.footer-btn
  font-size 0.8em
  background none
  border none
  color #828282
  &:hover
    color black
    text-decoration underline
    cursor pointer
.footer-right
  float right
.footer-btn-right
  color #ddd
@media (max-width 600px)
  .item-view-header
    h1
      font-size 1.25em
  .footer-right
    float none
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
