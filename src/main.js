// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'

// setup config
Vue.config.producsectionTip = false
Vue.prototype.$config = config

// import vue router
import router from './router'

// load config
import config from './config'

// import plugins
import './plugins/simpleMDE'
import './plugins/vue-js-modal'
import './plugins/vue-markdown'
import './plugins/vue-notification'

// register global utility filters.
import * as filters from './util/filters'
Object.keys(filters).forEach(key => {
  Vue.filter(key, filters[key])
})

// initialize the event listener
import './events'

import store from './store'

/* eslint-disable no-new */
new Vue({
  el: '#' + config.containerId,
  store,
  router,
  template: `<router-view :key="$route.params.thread || ''"></router-view>`
})

// depthLimit=Infinity should be used when it's embeded, prevent the url-bar changing
if (config.embedded) {
  router.replace('/')
}
