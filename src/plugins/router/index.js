import VueCookies from 'vue-cookies'
import { createRouter, createWebHistory } from 'vue-router'
import { routes } from './routes'
//import socket from 'vue3-websocket'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

export default function (app) {
  app.use(VueCookies)

  app.provide('router', router)
  
  router.beforeEach((to, from, next) => {
    const isAuthenticated = $cookies.get('jwtToken')

    app.provide("auth", isAuthenticated)

    if (!(to.path === '/login' || to.path === '/register') && !isAuthenticated) { // 로그인 화면이 아니고, 인증되지 않은 경우
      next('/login'); // 로그인 화면으로 이동
    } else {
      next(); // 그 외의 경우에는 이동을 허용
    }
  });
  
  // admin 페이지 권한 확인
  router.beforeEach(async (to, from, next) => {
    const isAuthenticated = $cookies.get('jwtToken')
    const userAddress = inject('userAddress')

    if (to.path.startsWith('/admin')) {
      try {
        const response = await fetch(`http://${userAddress}/api/user/isadmin`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${$cookies.get('jwtToken')}`,
          },
          credentials: 'include'
        });
        if (response.ok) {
          const isAdmin = await response.json();
          if (isAuthenticated && isAdmin) {
            next();
          } else {
            next('/dashboard');
          }
        } else {
          throw new Error('Failed to fetch isAdmin status');
        }
      } catch (error) {
        console.error(error);
        next('/dashboard');
      }
    } else {
      next();
    }
  });

  app.use(router)
}
export { router }

