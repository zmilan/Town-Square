<template>
  <div id="app" class="item-view">
    <img src="./assets/logo.png">
    <template v-if="rootComment">
      <h3>text: {{ rootComment.text }}</h3>
      <h3>child: {{ rootComment.child }}</h3>
      <h3>sibling: {{ rootComment.sibling }}</h3>
      <h3>author: {{ rootComment.author }}</h3>
      <h3>ipfsHash: {{ rootComment.ipfsHash }}</h3>
      <h3>moderator: {{ rootComment.moderator }}</h3>
      <h3>moderated: {{ rootComment.moderated }}</h3>
      <h3>datePosted: {{ rootComment.datePosted }}</h3>
      <svg :data-jdenticon-value="rootComment.author" width="80" height="80">
        Fallback text or image for browsers not supporting inline svg.
      </svg>

      <ul v-if="!loading" class="comment-children">
        <comment v-for="id in rootComment.children" :key="id" :id="id"></comment>
      </ul>

      <!-- <div class="item-view-header">
        <a :href="item.url" target="_blank">
          <h1>{{ item.title }}</h1>
        </a>
        <span v-if="item.url" class="host">
          ({{ item.url | host }})
        </span>
        <p class="meta">
          {{ item.score }} points
          | by <router-link :to="'/user/' + item.by">{{ item.by }}</router-link>
          {{ item.time | timeAgo }} ago
        </p>
      </div>
      <div class="item-view-comments">
        <p class="item-view-comments-header">
          {{ item.kids ? item.descendants + ' comments' : 'No comments yet.' }}
          <spinner :show="loading"></spinner>
        </p>
        <ul v-if="!loading" class="comment-children">
          <comment v-for="id in item.kids" :key="id" :id="id"></comment>
        </ul>
      </div> -->
    </template>
    <textarea class="editor" ref="textBox" id="MyID"></textarea>
    <button @click="addComment">reply</button>
    <button @click="createThread">new thread</button>
  </div>
</template>

<script>
import Spinner from './components/Spinner.vue'
import Comment from './components/Comment.vue'
import { ADD_COMMENT, CREATE_THREAD, FETCH_COMMENT } from './store/types'
import 'jdenticon'

export default {
  name: 'app',
  components: { Spinner, Comment },
  data: () => ({
    loading: false
  }),
  computed: {
    rootComment () {
      return this.$store.state.comments[this.$store.state.rootCommentId]
    }
  },
  // Fetch comments when mounted on the client
  beforeMount () {
    this.fetchThread()
  },
  // refetch comments if item changed
  watch: {
    rootComment: function (val) {
      this.fetchComments(val, 3, 3)
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
        if (comment.child && depth > 0) {
          this.$store.dispatch(FETCH_COMMENT.type, {
            id: comment.child
          }).then(() => {
            return this.fetchComments(this.$store.state.comments[comment.child], breadth, depth--)
          })
        }

        if (comment.sibling && breadth > 0) {
          this.$store.dispatch(FETCH_COMMENT.type, {
            id: comment.sibling
          }).then(() => {
            return this.fetchComments(this.$store.state.comments[comment.sibling], breadth--, depth)
          })
        }
      }
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
  #app
    font-family: 'Avenir', Helvetica, Arial, sans-serif
    -webkit-font-smoothing: antialiased
    -moz-osx-font-smoothing: grayscale
    text-align: left
    color: #2c3e50
    margin-top: 60px
  .editor
    width:500px
</style>

<style>
  @import '~simplemde/dist/simplemde.min.css';
</style>
