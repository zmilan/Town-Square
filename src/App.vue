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
    <textarea></textarea>
    <button v-on:click="addComment">reply</button>
    <button v-on:click="createThread">new thread</button>
  </div>
</template>

<script>
import Spinner from './components/Spinner.vue'
import Comment from './components/Comment.vue'
import { ADD_COMMENT, CREATE_THREAD, FETCH_COMMENT } from './store/types'

const rootCommentIndex = 6

export default {
  name: 'app',
  components: { Spinner, Comment },
  data: () => ({
    loading: true
  }),
  computed: {
    rootComment () {
      return this.$store.state.comments[rootCommentIndex]
    }
  },
  // Fetch comments when mounted on the client
  beforeMount () {
    this.fetchThread()
  },
  // refetch comments if item changed
  watch: {
    rootComment: 'fetchComments'
  },
  methods: {
    createThread () {
      this.$store.dispatch(CREATE_THREAD.type, {
        text: 'hello my name is will'
      })
    },

    fetchThread () {
      this.loading = true
      this.$store.dispatch(FETCH_COMMENT.type, {
        id: rootCommentIndex
      })
    },

    fetchComments (comment) {
      if (comment && (comment.child || comment.sibling)) {
        console.log(comment.child || comment.sibling)
        this.$store.dispatch(FETCH_COMMENT.type, {
          id: comment.child || comment.sibling
        }).then(id => {
          return this.fetchComments(this.$store.state.comments[id])
        })
      }
    },

    addComment () {
      this.$store.dispatch(ADD_COMMENT.type, {
        parent: rootCommentIndex,
        text: 'hi will nice to meet you'
      })
    }
  }
}

</script>

<style>
  #app {
    font-family: 'Avenir', Helvetica, Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-align: center;
    color: #2c3e50;
    margin-top: 60px;
  }
</style>
