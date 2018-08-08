<template>
  <div class="item-view" v-if="rootComment">
    <template v-if="rootComment">
      <div class="item-view-header">
        <a :href="rootComment.url" target="_blank">
          <h1>{{ rootComment.text }}</h1>
        </a>
        <span v-if="rootComment.url" class="host">
          ({{ rootComment.url | host }})
        </span>
        <p class="meta">
          <div>{{ rootComment.author }}</div>
          {{ rootComment.time | timeAgo }} ago
        </p>
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
import Spinner from './components/Spinner.vue'
import Comment from './components/Comment.vue'
import { ADD_COMMENT, CREATE_THREAD, FETCH_COMMENT, GET_ACCOUNT } from './store/types'

export default {
  name: 'app',
  components: { Spinner, Comment },
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
    },

    addComment () {
      this.$store.dispatch(ADD_COMMENT.type, {
        parent: this.$store.state.rootCommentId,
        text: 'another one'
      })
    }
  }
}

</script>

<style lang="stylus">
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
.comment-children
  list-style-type none
  padding 0
  margin 0
@media (max-width 600px)
  .item-view-header
    h1
      font-size 1.25em
</style>

<style>
  @import '~simplemde/dist/simplemde.min.css';
</style>
