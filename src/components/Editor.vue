<template>
  <markdown-editor v-model="content" ref="markdownEditor" :configs="markdownConfigs"></markdown-editor>
</template>

<script>
import markdownEditor from 'vue-simplemde/src/markdown-editor'
import { ADD_COMMENT, EDIT_COMMENT } from '../store/types'

export default {
  name: 'editor',
  props: ['id', 'autosave', 'initialContent'],
  components: {
    markdownEditor
  },
  data () {
    return {
      content: this.initialContent || '',
      markdownConfigs: {
        autosave: {
          enabled: this.autosave,
          uniqueId: 'pigeon-' + this.id,
          delay: 1000
        },
        placeholder: 'What are your thoughts?',
        spellChecker: false,
        status: []
      }
    }
  },
  methods: {
    submitReply () {
      console.log(this.content)
      this.$store.dispatch(ADD_COMMENT.type, {
        parent: this.id,
        text: this.content
      })
    },
    submitEdit () {
      console.log(this.content)
      this.$store.dispatch(EDIT_COMMENT.type, {
        id: this.id,
        text: this.content
      })
    }
  }
}
</script>
<style lang="stylus">
.markdown-editor .CodeMirror, .markdown-editor .CodeMirror-scroll
  min-height 100px
.editor-toolbar::before
  margin 0
.editor-toolbar::after
  margin 0
  content ''
</style>
