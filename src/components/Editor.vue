<template>
  <markdown-editor v-model="content" ref="markdownEditor" :configs="markdownConfigs"></markdown-editor>
</template>

<script>
import markdownEditor from 'vue-simplemde/src/markdown-editor'
import { PUBLISH_COMMENT, PUBLISH_THREAD } from '../store/types'

export default {
  name: 'editor',
  props: ['id', 'autosave', 'initialContent', 'placeholder'],
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
        placeholder: this.placeholder || 'What are your thoughts?',
        spellChecker: false,
        status: []
      }
    }
  },
  methods: {
    submitReply () {
      this.$store.dispatch(PUBLISH_COMMENT, {
        parent: this.id,
        text: this.content
      })
      this.content = ''
    },
    submitThread (moderator) {
      this.$store.dispatch(PUBLISH_THREAD, {
        moderator,
        text: this.content
      })
      this.content = ''
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
