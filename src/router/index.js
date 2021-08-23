import Vue from 'vue'
import VueRouter from 'vue-router'
import Login from '../components/login.vue'
import Home from '../components/Home.vue'
import Regist from '../components/registered.vue'
import Welcome from '../components/welcome.vue'
import User from '../components/user/User.vue'
Vue.use(VueRouter)

const routes = [
  {
    path: '/', redirect: '/login'
  },
  {
    path: '/login',
    component: Login
  },
  {
    path: '/home',
    component: Home,
    redirect: '/welcome', children: [{ path: '/welcome', component: Welcome }, { path: '/users', component: User }]


  },
  {
    path: '/registered',
    component: Regist
  }
]

const router = new VueRouter({
  routes
})

router.beforeEach((to, from, next) => {
  if (to.path === '/login') return next();
  const tokenStr = window.sessionStorage.getItem('token')
  if (!tokenStr) return naxt('/login');
  next()
})

export default router
