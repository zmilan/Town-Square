<template>
  <li v-if="comment && !comment.moderated" class="comment">
    <div class="comment-content">
      <div class="byline">
        
        <identicon class="identicon" :address="comment.author"></identicon>
        
        <a class="by" @mouseover="showDetails = true" @mouseout="showDetails = false">
          <a v-if="showDetails" :href="etherscanUrl" target="_blank" rel="noopener noreferrer">{{ authorName || comment.author }}</a>
          <a v-else>{{ authorName || comment.author }}</a>    
          •
        </a>

        <a class="by">
          <a v-if="showDetails">{{ comment.datePosted | dateString }}</a>
          <a v-else>{{ comment.datePosted | timeAgo }}</a>
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
      
      </div>

      <div v-show="open">

        <div v-if="text && !editing">
          <vue-markdown v-once class="text">{{ text }}</vue-markdown>
        </div>
        <!-- <vue-markdown v-if="!editing && text" class="text">{{ text }}</vue-markdown> -->
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
            <editor ref="replyEditor" :id="id" :autosave="true"></editor>
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
  </li>
</template>

<script>
import { mapActions } from 'vuex'
import VueMarkdown from 'vue-markdown'

import Editor from './Editor'
import Identicon from './Identicon'
import { FETCH_COMMENTS, MODERATE_COMMENT } from '../store/types'

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
      showDetails: false
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
      return 'https://rinkeby.etherscan.io/address/' + this.$store.state.comments[this.id].author
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
    },
    update () {
      this.$refs.editingEditor.submitEdit()
    },
    ...mapActions({
      'fetchComments': FETCH_COMMENTS.type,
      'moderate': MODERATE_COMMENT.type
    })
  }
}
</script>
<style lang="stylus">
fontSize = 1em

.comment-children
  .comment-children
    margin-left 0.5em
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
