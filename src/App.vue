<template>
  <div class="item-view" v-if="rootComment">
    <template v-if="rootComment">
      <div class="item-view-header">
        <a :href="rootComment.url" target="_blank">
          <h1>{{ rootComment.text }}</h1>
        </a>
        <p class="meta">
          <div>{{ rootComment.author }}</div>
          {{ rootComment.time | timeAgo }} ago
        </p>
        <editor :id="rootComment.id" ref="replyEditor" :autosave="false"></editor>
        <button class="add-comment-btn" @click="addComment">add comment</button>
      </div>
      <div class="item-view-comments">
        <p class="item-view-comments-header">
          {{ rootComment.children ? '' : 'No comments yet.' }}
          <spinner :show="loading"></spinner>
        </p>
        <ul v-if="!loading" class="comment-children">
          <comment v-for="id in rootComment.children" :key="id" :id="id"></comment>
        </ul>
      </div>
    </template>
  </div>
</template>

<script>
import Comment from './components/Comment.vue'
import Editor from './components/Editor'
import Spinner from './components/Spinner.vue'
import { CREATE_THREAD, FETCH_COMMENT, GET_ACCOUNT } from './store/types'

export default {
  name: 'app',
  components: {
    Editor,
    Comment,
    Spinner
  },
  data: () => ({
    loading: true
  }),
  computed: {
    rootComment () {
      return this.$store.state.comments[this.$store.state.rootCommentId]
    }
  },
  // Fetch comments when mounted on the client
  beforeMount () {
    this.$store.dispatch(GET_ACCOUNT.type)
    this.fetchThread()
  },
  // refetch comments if item changed
  watch: {
    rootComment: function (val) {
      this.fetchComments(val, 3, 3).then(() => {
        console.log('done')
        this.loading = false
      })
    }
  },
  methods: {
    addComment () {
      this.$refs.replyEditor.submitReply()
    },

    createThread () {
      this.$store.dispatch(CREATE_THREAD.type, {
        text: 'hello my name is will'
      })
    },

    fetchThread () {
      this.$store.dispatch(FETCH_COMMENT.type, {
        id: this.$store.state.rootCommentId
      })
    },

    fetchComments (comment, breadth, depth) {
      if (comment) {
        const promises = []
        if (comment.child && depth > 0) {
          promises.push(
            this.$store.dispatch(FETCH_COMMENT.type, {
              id: comment.child
            }).then(() => {
              console.log('depth')
              return this.fetchComments(this.$store.state.comments[comment.child], breadth, depth--)
            })
          )
        }

        if (comment.sibling && breadth > 0) {
          promises.push(
            this.$store.dispatch(FETCH_COMMENT.type, {
              id: comment.sibling
            }).then(() => {
              console.log('breadth')
              return this.fetchComments(this.$store.state.comments[comment.sibling], breadth--, depth)
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
  padding 1.8em 2em 1em
  box-shadow 0 1px 2px rgba(0,0,0,.1)
  h1
    display inline
    font-size 1.5em
    margin 0
    margin-right .5em
  .host, .meta, .meta a
    color #828282
  .meta a
    text-decoration underline
.add-comment-btn
  background none
  border 2px solid
  color #828282
  margin 1em
  &:hover
    color black
    text-decoration underline
    cursor pointer
.item-view-comments
  background-color #fff
  margin-top 10px
  padding 0 2em .5em
.item-view-comments-header
  margin 0
  font-size 1.1em
  padding 1em 0
  position relative
  .spinner
    display inline-block
    margin -15px 0
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
</style>

<style>
  @import '~simplemde/dist/simplemde.min.css';
</style>
