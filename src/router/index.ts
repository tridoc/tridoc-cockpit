import Vue from 'vue'
import VueRouter, { RouteConfig } from 'vue-router'
import Home from '../views/Home.vue'
import Document from '../views/Document.vue'
import ShareTarget from '../views/ShareTarget.vue'

Vue.use(VueRouter)

const routes: Array<RouteConfig> = [
  {
    path: '/',
    name: 'home',
    component: Home,
    props: route => ({ page: route.query.p })
  },
  {
    path: '/doc/:id',
    name: 'doc',
    component: Document,
    props: true,
  },
  {
    path: '/share-target',
    name: 'sharetarget',
    component: ShareTarget,
    props: true,
  }
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})

export default router
