<template>
  <li v-if="comment" class="comment">
    <div class="comment-content">
      <a class="by" @mouseover="showDetails = true" @mouseout="showDetails = false">
        <a v-if="showDetails" :href="etherscanUrl" target="_blank" rel="noopener noreferrer">{{ comment.author }}</a>
        <a v-else>{{ comment.author | truncate }}</a>    
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
              : '[+] ' + (comment.children.length + 1) + ' collapsed'
        }}</a>
      </a>

      <div v-show="open">

        <vue-markdown v-if="!editing" class="text">{{ comment.text }}</vue-markdown>
        <transition name="slide-fade">
          <div v-if="editing">
            <editor :id="id" ref="editingEditor" :autosave="false" :initialContent="comment.text"></editor>
            <div class="md-btns">
              <button class="md-btn" @click="editing = false">Cancel</button>
              <button class="md-btn update" @click="update">Update</button>
            </div>
          </div>
        </transition>

        <div class="action-btns" v-if="!replying && !editing">
          <button class="action-btn" @click="replying = true">reply</button>
          <button class="action-btn" v-if="account == comment.author" @click="editing = true">edit</button>
          <button class="action-btn" v-if="account == comment.moderator && !comment.moderated" @click="moderate(true)">moderate</button>
          <button class="action-btn" v-if="account == comment.moderator && comment.moderated" @click="moderate(false)">unmoderate</button>
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
          <comment v-for="id in comment.children" :key="id" :id="id"></comment>
        </ul>

      </div>
    </div>
  </li>
</template>

<script>
import vueMarkdown from 'vue-markdown'
import Editor from './Editor'

export default {
  name: 'comment',
  props: ['id'],
  components: {
    Editor,
    vueMarkdown
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
    etherscanUrl () {
      return 'https://rinkeby.etherscan.io/address/' + this.$store.state.comments[this.id].author
    },
    account () {
      return this.$store.state.account
    }
  },
  methods: {
    reply () {
      this.$refs.replyEditor.submitReply()
    },
    update () {
      this.$refs.editingEditor.submitEdit()
    },
    moderate (value) {

    },
    edit () {

    }
  }
}
</script>
<style lang="stylus">
.comment-children
  .comment-children
    margin-left 0.5em
.comment
  position relative
  border-left 1px solid #eee
  margin-top 1em
  .comment-content
    margin-left 1em
    .by, .text, .toggle
      font-size .9em
    .by
      color #828282
      width fit-content
      a
        color #828282
        text-decoration none
    .text
      overflow-wrap break-word
      a:hover
        color #ff6600
      p
        margin 0.2em 0
    .slide-fade-enter-active 
      transition: all .3s ease
    .slide-fade-enter
      transform translateX(-10px)
      opacity 0
    .md-btns
      text-align right
      .md-btn
        background none
        border none
        color #828282
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
        &:hover
          color black
          text-decoration underline
          cursor pointer
    .toggle
      background-color #fffbf2
      padding .3em .5em
      border-radius 4px
      a
        color #828282
        cursor pointer
      &.open
        padding 0
        background-color transparent
        margin-bottom -0.5em
</style>

<style lang="stylus">
/* not scoped */
.comment
  .comment-content
    .text
      p
        margin 0.2em 0
</style>
