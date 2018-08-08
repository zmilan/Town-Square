<template>
  <li v-if="comment" class="comment">
    <a class="by" @mouseover="showDetails = true" @mouseout="showDetails = false">
      <a v-if="showDetails" :href="etherscanUrl" target="_blank" rel="noopener noreferrer">{{ comment.author }}</a>
      <a v-else>{{ comment.author | truncate }}</a>    
      •
    </a>
    <a class="by">
      <a v-if="showDetails">{{ comment.datePosted | dateString }}</a>
      <a v-else>{{ comment.datePosted | timeAgo }}</a>
    </a>
    <vue-markdown class="text">{{ comment.text }}</vue-markdown>
    <div v-if="!replying">
      <button class="action-btn" @click="replying = true">reply</button>
      <button class="action-btn" v-if="account == comment.author" @click="editing = true">edit</button>
      <button class="action-btn" v-if="account == comment.moderator && !comment.moderated" @click="moderate(true)">moderate</button>
      <button class="action-btn" v-if="account == comment.moderator && comment.moderated" @click="moderate(false)">unmoderate</button>
    </div>

    <transition name="slide-fade">
      <div v-if="replying">
        <markdown-editor v-model="content" ref="markdownEditor" :configs="markdownConfigs"></markdown-editor>
        <div class="md-btns">
          <button class="md-btn" @click="replying = false">Cancel</button>
          <button class="md-btn" @click="reply">Reply</button>
        </div>
      </div>
    </transition>

    <div class="toggle" :class="{ open }" v-if="comment.children && comment.children.length">
      <a @click="open = !open">{{
        open
            ? '[-]'
            : '[+] ' + pluralize(comment.children.length) + ' collapsed'
      }}</a>
    </div>

    <ul class="comment-children" v-show="open">
      <comment v-for="id in comment.children" :key="id" :id="id"></comment>
    </ul>

  </li>
</template>

<script>
import vueMarkdown from 'vue-markdown'
import markdownEditor from 'vue-simplemde/src/markdown-editor'
import { ADD_COMMENT } from '../store/types'

export default {
  name: 'comment',
  props: ['id'],
  components: {
    markdownEditor,
    vueMarkdown
  },
  data () {
    return {
      open: true,
      replying: false,
      content: '',
      showDetails: false,
      markdownConfigs: {
        autosave: {
          enabled: true,
          uniqueId: 'pigeon-' + this.id,
          delay: 1000
        },
        placeholder: 'What are your thoughts?',
        spellChecker: false,
        status: ['autosave']
      }
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
    pluralize: n => n + (n === 1 ? ' reply' : ' replies'),
    reply () {
      console.log(this.content)
      this.$store.dispatch(ADD_COMMENT.type, {
        parent: this.comment.id,
        text: this.content
      }).then(() => {
        this.replying = false
      })
    },
    moderate (value) {

    },
    edit () {

    }
  }
}
</script>
<style lang="stylus" scoped>
.comment-children
  .comment-children
    margin-left 1.5em
.comment
  border-top 1px solid #eee
  position relative
  .by, .text, .toggle
    font-size .9em
    margin 1em 0
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
    pre
      white-space pre-wrap
  .slide-fade-enter-active 
    transition: all .3s ease
  .slide-fade-enter
    transform translateX(-10px)
    opacity 0
  .md-btns
    text-align right
    width 100%
    margin 1em
  .md-btn
    background:none
    border:none
    color #828282
  .action-btn
    background:none
    border:none
    color #828282
    &:hover
      text-decoration underline
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
