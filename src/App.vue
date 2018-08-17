<template>
  <div class="item-view">
    
    <about-pigeon-modal />
    <create-thread-modal />
    <register-name-modal />
    <settings-modal />
    <notification group="ipfs-notification"/>
    <notification group="ethereum-notification"/>

    <template v-if="rootComment">
      <div class="item-view-header">
        <div class="title-block">
          <!-- TODO, make text a component -->
          <div v-if="text && text.value">
            <vue-markdown v-once class="text">{{ text.value }}</vue-markdown>
          </div>

          <div class="byline">

            <identicon class="identicon" :address="rootComment.author"></identicon>

            <a class="by" @mouseover="showDetails = true" @mouseout="showDetails = false">
              <a>{{ authorName || rootComment.author }}</a>    
              •
            </a>
            <a class="by">
              <a>{{ rootComment.datePosted | timeAgo }}</a>
              •
            </a>
            
            <a class="by">
              <a>moderator: </a>
            </a>
            <identicon class="identicon" :address="rootComment.moderator"></identicon>
            <a class="by">
              <a>{{ moderatorName || rootComment.moderator }}</a>
            </a>
          </div>        
        </div>
      </div>

      <div v-if="ethAddress">
        <editor :id="rootComment.id" ref="replyEditor" :autosave="false" :placeholder="editorPlaceholderTop"></editor>
        <button class="add-comment-btn" @click="addComment">add comment</button>
      </div>
      <hr class="divider">

      <div class="item-view-comments">
        <p class="item-view-comments-header">
          <spinner :show="loading" class="spinner"></spinner>
        </p>
        <ul v-if="!loading && rootComment.child" class="comment-children">
          <comment v-for="id in children" :key="id" :id="id" :depth="1"></comment>
        </ul>
        <div v-if="!loading && !rootComment.child" class="no-comments-container">
          <div class="no-comments-msg">Be the first to comment 🕊️</div>
        </div>
      </div>

      <hr class="divider">

      <div>
        <span>
          <button class="logo footer-btn" @click="$modal.show('about-pigeon-modal')">
            🕊️ pigeon
          </button>
          |
          <button class="footer-btn" @click="$modal.show('create-thread-modal')">
            🌳 add pigeon to your site
          </button>
          |
          <button class="footer-btn" @click="$modal.show('register-name-modal')">
            📇 register your name
          </button>
          |
          <button class="footer-btn" @click="$modal.show('settings-modal')">
            ⚙️ settings
          </button>
        </span>
        <div class="footer-right">
          <button class="footer-btn footer-btn-right">
            version {{version}}
          </button>
        </div>
      </div>
    </template>
  </div>
</template>

<script>
import debounce from 'lodash.debounce'
import throttle from 'lodash.throttle'
import { mapActions } from 'vuex'
import VueMarkdown from 'vue-markdown'

import AboutPigeonModal from './components/modals/About-Pigeon-Modal'
import Comment from './components/Comment'
import CreateThreadModal from './components/modals/Create-Thread-Modal'
import Editor from './components/Editor'
import Emitter from './util/emitter'
import Identicon from './components/Identicon'
import Notification from './components/Notification'
import RegisterNameModal from './components/modals/Register-Name-Modal'
import SettingsModal from './components/modals/Settings-Modal'
import Spinner from './components/Spinner'
import { FETCH_COMMENT, FETCH_COMMENTS, UPDATE_ETH_ADDRESS, UPDATE_ETHEREUM_CONNECTION, UPDATE_IPFS_CONNECTION } from './store/types'
import ETHEREUM_STATUS from './enum/ethereumStatus'
import IPFS_STATUS from './enum/ipfsStatus'

export default {
  name: 'app',
  components: {
    AboutPigeonModal,
    Comment,
    CreateThreadModal,
    Editor,
    Identicon,
    Notification,
    RegisterNameModal,
    SettingsModal,
    Spinner,
    VueMarkdown
  },
  data: () => ({
    IPFS_STATUS,
    editorPlaceholderTop: window.config.editorPlaceholderTop,
    loading: false, // TODO, start with loading = true
    rootCommentId: window.config.rootCommentId,
    showDetails: false, // TODO, make this a popover
    version: process.env.version
  }),
  computed: {
    authorName () {
      return this.$store.state.names[this.rootComment.author]
    },
    children () {
      return this.$store.state.children[this.rootCommentId] || []
    },
    corsOrigin () {
      return JSON.stringify(JSON.stringify([window.location.origin]))
    },
    ethAddress () {
      return this.$store.state.ethAddress
    },
    ethereumStatus () {
      return this.$store.state.ethereumStatus
    },
    ipfsStatus () {
      return this.$store.state.ipfsStatus
    },
    ipfsUrl () {
      return this.$store.state.ipfsUrl
    },
    moderatorName () {
      return this.$store.state.names[this.rootComment.moderator]
    },
    rootComment () {
      return this.$store.state.comments[this.rootCommentId]
    },
    text () {
      return this.$store.state.texts[this.rootCommentId]
    }
  },
  beforeMount () {
    this.updateEthereumConnection({url: window.config.ethereumUrl}).then(() => {
      return this.updateIpfsConnection({url: window.config.ipfsUrl})
    }).then(() => {
      // Load the root comment first
      this.fetchComment({id: this.rootCommentId}).then(() => {
        if (this.rootComment && this.rootComment.child) {
          // Now start load the other comments
          this.fetchComments({
            id: this.rootComment.child,
            numberToLoad: 15,
            depth: Math.min(window.config.depthLimit - 1, 3)
          })
        }
      })
    })
  },
  created () {
    // register metamask event listeners
    Emitter.on('Metamask-Update', debounce(function (details) {
      try {
        this.updateEthAddress({ address: details.selectedAddress })
      } catch (err) {
        console.error(err)
      }
    }.bind(this)), 1000)
  },
  watch: {
    ipfsStatus: throttle(function (status) {
      this.$notify({
        group: 'ipfs-notification',
        clean: true
      })
      if (status === IPFS_STATUS.ERROR) {
        this.$notify({
          group: 'ipfs-notification',
          title: '😿 can\'t connect to IPFS',
          text: 'gateway: ' + this.ipfsUrl,
          type: 'error',
          duration: -1
        })
      } else if (status === IPFS_STATUS.STILL_CHECKING) {
        this.$notify({
          group: 'ipfs-notification',
          title: 'It\'s taking longer than normal to connect to IPFS...',
          type: 'warn',
          duration: -1
        })
      }
    }, 1000),
    ethereumStatus: throttle(function (status) {
      this.$notify({
        group: 'ethereum-notification',
        clean: true
      })
      if (status === ETHEREUM_STATUS.ERROR) {
        let msg = ''
        if (typeof window.web3 === 'undefined') {
          msg += ' trying to connect to node: ' + this.$store.state.ethereumUrl
        }

        if (process.env.NODE_ENV === 'development') {
          msg += ' make sure you are connected to the Rinkeby network (development)'
        } else {
          msg += ' make sure you are connected to the mainnet'
        }

        this.$notify({
          group: 'ethereum-notification',
          title: '😿 can\'t connect to Ethereum network',
          text: msg,
          type: 'error',
          duration: -1
        })
      }
    }, 1000)
  },
  methods: {
    addComment () {
      this.$refs.replyEditor.submitReply()
    },
    ...mapActions({
      'fetchComment': FETCH_COMMENT,
      'fetchComments': FETCH_COMMENTS,
      'updateEthAddress': UPDATE_ETH_ADDRESS,
      'updateEthereumConnection': UPDATE_ETHEREUM_CONNECTION,
      'updateIpfsConnection': UPDATE_IPFS_CONNECTION
    })
  }
}

</script>

<style lang="stylus" scoped>
.item-view-header
  background-color #fff
  display flex
  flex-direction row
  .title-block
    margin: 0 0 0.5em 0.5em
    .text
      font-size 1.1em
      overflow-wrap break-word
    .byline
      font-size 0.8em
      color #828282
      .identicon
        width: 2em
      .identicon, .by
        display inline-block
        vertical-align middle
.add-comment-btn
  background none
  border 2px solid
  color #444
  margin 1em
  &:hover
    color black
    cursor pointer
.item-view-comments
  background-color #fff
  margin-top 1px
  .no-comments-container
    height 100px
    position relative
    .no-comments-msg
      position absolute
      top 50%
      left 50%
      transform translateX(-50%) translateY(-50%)
      white-space nowrap
.item-view-comments-header
  margin 0
  font-size 1.1em
  padding 0.2em 0
  position relative
  .spinner
    display inline-block
    margin -15px 0
    width 100%
.divider
  border 0
  height 1px
  background #ddd
.logo
  font-size 1.25em
.footer-btn
  font-size 0.8em
  background none
  border none
  color #828282
  &:hover
    color black
    text-decoration underline
    cursor pointer
.footer-right
  float right
.footer-btn-right
  color #ddd
@media (max-width 700px)
  .item-view-header
    h1
      font-size 1.25em
  .footer-right
    float none
</style>

<style lang="stylus">
/* not scoped */
.comment-children
  list-style-type none
  padding 0
  margin 0
.item-view-header
  .title-block
    .text
      p
        margin 0.2em 0
</style>

<style>
  @import '~simplemde/dist/simplemde.min.css';
</style>
