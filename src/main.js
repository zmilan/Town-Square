// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'

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

// setup config
Vue.config.producsectionTip = false
Vue.prototype.$config = config

import App from './App'
import store from './store'

/* eslint-disable no-new */
new Vue({
  el: '#' + config.containerId,
  store,
  template: '<App/>',
  components: { App }
})
