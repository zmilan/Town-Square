import Vue from 'vue'
import VueRouter from 'vue-router'

import config from './config'
import App from './App'

Vue.use(VueRouter)

const router = new VueRouter({
  mode: config.embedded ? 'abstract' : 'hash',
  routes: [
    { path: '/thread/:thread', component: App },
    { path: '*', component: App }
  ]
})

if (config.embedded) {
  router.beforeEach((to, from, next) => {
    next({ replace: true })
  })
}

export default router
