<template>
  <div class="item-view" v-if="rootComment">
    
    <about-pigeon-modal />
    <create-thread-modal />
    <register-name-modal />

    <template v-if="rootComment">
      <div class="item-view-header">
        <identicon :address="rootComment.author" class="identicon"></identicon>
        
        <div class="title-block">
          <vue-markdown v-if="text" class="text">{{ text }}</vue-markdown>
          
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

        <editor :id="rootComment.id" ref="replyEditor" :autosave="false"></editor>
        <button class="add-comment-btn" @click="addComment">add comment</button>
      </div>

      <hr class="divider">
      
      <div class="item-view-comments">
        <p class="item-view-comments-header">
          {{ rootComment.children ? '' : 'No comments yet.' }}
          <spinner :show="loading"></spinner>
        </p>
        <ul v-if="!loading && rootComment.child" class="comment-children">
          <comment v-for="id in rootComment.children" :key="id" :id="id"></comment>
        </ul>
        <div v-if="!loading && !rootComment.child" class="no-comments-container">
          <div class="no-comments-msg">Be the first to comment 🕊️</div>
        </div>
      </div>

      <hr class="divider">

      <div class="item-view-footer">
        <button class="logo footer-btn" @click="$modal.show('about-pigeon-modal')">
          🕊️pigeon
        </button>
        |
        <button class="footer-btn" @click="$modal.show('create-thread-modal')">
          add a pigeon thread to your site
        </button>
        |
        <button class="footer-btn" @click="$modal.show('register-name-modal')">
          register your name
        </button>
      </div>
    </template>
  </div>
</template>

<script>
import VueMarkdown from 'vue-markdown'

import AboutPigeonModal from './components/modals/About-Pigeon-Modal'
import Comment from './components/Comment'
import CreateThreadModal from './components/modals/Create-Thread-Modal'
import Editor from './components/Editor'
import Identicon from './components/Identicon'
import RegisterNameModal from './components/modals/Register-Name-Modal'
import Spinner from './components/Spinner'
import { FETCH_COMMENT, FETCH_NAME, FETCH_TEXT, GET_ACCOUNT } from './store/types'

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
    text () {
      return this.$store.state.texts[this.$store.state.rootCommentId]
    },
    authorName () {
      return this.$store.state.names[this.rootComment.author]
    },
    moderatorName () {
      return this.$store.state.names[this.rootComment.moderator]
    }
  },
  // Fetch comments when mounted on the client
  beforeMount () {
    this.$store.dispatch(GET_ACCOUNT.type)
    this.fetchThread()
  },
  methods: {
    addComment () {
      this.$refs.replyEditor.submitReply()
    },

    fetchThread () {
      this.$store.dispatch(FETCH_COMMENT.type, {
        id: this.$store.state.rootCommentId
      }).then(() => {
        const rootComment = this.$store.state.comments[this.$store.state.rootCommentId]
        return Promise.all([
          this.fetchCommentResources(rootComment),
          this.fetchComments(rootComment, 3, 3)
        ])
      })
    },
    fetchCommentResources (comment) {
      return Promise.all([
        this.$store.dispatch(FETCH_NAME.type, { address: comment.author }),
        this.$store.dispatch(FETCH_NAME.type, { address: comment.moderator }),
        this.$store.dispatch(FETCH_TEXT.type, { id: comment.id })
      ])
    },
    fetchComments (comment, breadth, depth) {
      if (comment) {
        const promises = []
        if (comment.child && depth > 0) {
          console.log(comment.id + ' -> ' + comment.child)
          promises.push(
            this.$store.dispatch(FETCH_COMMENT.type, {
              id: comment.child
            }).then(() => {
              const childComment = this.$store.state.comments[comment.child]
              console.log('depth', comment, childComment)
              const promises = [
                this.fetchCommentResources(childComment),
                this.fetchComments(childComment, breadth, --depth)
              ]
              return promises
            })
          )
        }

        if (comment.sibling && breadth > 0) {
          console.log(comment.id + ' -> ' + comment.sibling)
          promises.push(
            this.$store.dispatch(FETCH_COMMENT.type, {
              id: comment.sibling
            }).then(() => {
              console.log('breadth')
              const siblingComment = this.$store.state.comments[comment.sibling]
              const promises = [
                this.fetchCommentResources(siblingComment),
                this.fetchComments(siblingComment, --breadth, depth)
              ]
              return promises
            })
          )
        }

        return Promise.all(promises)
      }

      return true
    }
  }
}

</script>

<style lang="stylus" scoped>
.item-view-header
  background-color #fff
  // box-shadow 0 0 2px rgba(1,0,0,.1)
  // box-shadow 5px 5px 1px 2px rgba(0,0,0,.1)
  .identicon
    display inline-block
    width 2em
    vertical-align top
  .title-block
    display inline-block
    margin: 0 .3em
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
@media (max-width 600px)
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
