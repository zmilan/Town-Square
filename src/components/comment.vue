<template>
  <li v-if="comment" class="comment">
    <div class="by">
      <!-- <router-link :to="'/user/' + comment.by">{{ comment.author }}</router-link> -->
      {{ comment.datePosted | timeAgo }} ago
    </div>
    <div class="text" v-html="comment.text"></div>
    <button class="reply" v-if="!replying" @click="replying = true">reply</button>
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
    
    <div v-if="replying">
      <markdown-editor v-model="content" ref="markdownEditor"></markdown-editor>
      <button @click="reply">Reply</button>
      <button @click="replying = false">Cancel</button>
    </div>
  </li>
</template>

<script>
import markdownEditor from 'vue-simplemde/src/markdown-editor'
import { ADD_COMMENT } from '../store/types'

export default {
  name: 'comment',
  props: ['id'],
  components: {
    markdownEditor
  },
  data () {
    return {
      open: true,
      replying: false,
      content: ''
    }
  },
  computed: {
    comment () {
      return this.$store.state.comments[this.id]
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
    a
      color #828282
      text-decoration underline
  .text
    overflow-wrap break-word
    a:hover
      color #ff6600
    pre
      white-space pre-wrap
  .reply
    background:none
    border:none
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
