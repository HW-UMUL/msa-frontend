export const routes = [
  { path: '/', redirect: '/dashboard' },
//  { path: '/', redirect: '/testsss' },
  {
    path: '/',
    component: () => import('@/layouts/default.vue'),
    children: [

      // {
      //   path: 'testsss',
      //   component: () => import('@/pages/test.vue'),
      // },


      {
        path: 'dashboard',
        component: () => import('@/pages/dashboard.vue'),
      },
      ///////////////// 대호

      {
        path: 'wiki',
        component: () => import('@/d_wiki/wikilist.vue'),
      },
      {
        path: '/readwiki/:id',
        name: 'readwiki',
        component: () => import('@/d_wiki/readwiki.vue'),
        props: true // URL 파라미터를 컴포넌트의 props로 전달합니다.
      }, 

      {
        path: 'writewiki',
        component: () => import('@/d_wiki/wikieditorwrite.vue')
      },

      {
        path: 'updatewiki/:id',
        component: () => import('@/d_wiki/wikiupdate.vue'),
        props: true
      },

      {
        path: 'wikilog/:id',
        component: () => import('@/d_wiki/viewwikilogs.vue'),
        props: true
      },


      /////////////////////////////////////
      /*
      {
        path: 'wiki',
        component: () => import('@/pages/wiki.vue'),
      },

      {
        path: 'writewiki',
        component: () => import('@/pages/writewiki.vue')
      },

      */

      /////////////////////////////////////



      // updatepost
      //////////////////////////// 규혁
      {
        path: 'updatepost/:id',
        component: () => import('@/k_pages/updatepost.vue'),
        props: true
      },
      {
        path: 'writepost',
        component: () => import('@/k_pages/writepost.vue')
      },

      /*
      {
        path: 'writepost',
        component: () => import('@/pages/writepost.vue')
      },

      */
      /////////////////////////////////////


      {
        path: 'table',
        component: () => import('@/pages/mytables.vue')
      },


      {
        path: 'createtable',
        component: () => import('@/pages/createtable.vue')
      },

      
      {
        path: 'chat',
        component: () => import('@/pages/chathome.vue')
      },
      {
        path: 'chatroom/:roomId',
        component: () => import('@/pages/chatroom.vue'),
        props: true
      },



      {
        path: 'follow',
        component: () => import('@/pages/follow.vue')
      },




      {
        path: `/search/:keyword/Post`,
        component: () => import('@/pages/dashboard.vue'),
        props: true
      },
      {
        path: `/search/:keyword/Wiki`,
        component: () => import('@/d_wiki/wikilist.vue'),
        props: true
      },



      {
        path: '/search',
        component: () => import('@/pages/dashboard.vue'),
        props: true
      },






      /////////////// MYMY
      {
        path: 'mypage',
        component: () => import('@/pages/mypage.vue'),
      },
      {
        path: 'mytables/:tableId',
        component: () => import('@/pages/tabledetail.vue'),
        props: true
      },


      {
        path: 'writepost/:tableId',
        component: () => import('@/pages/writetablepost.vue'),
        props: true
      },


      {
        path: 'writewiki/:tableId',
        component: () => import('@/pages/writetablewiki.vue'),
          props: true
      },



      {
        path: 'myposts',
        component: () => import('@/pages/myposts.vue'),
      },
      {
        path: 'mywikis',
        component: () => import('@/pages/mywikis.vue'),
      },
      {
        path: 'myreplys',
        component: () => import('@/pages/myreplys.vue'),
      },
      {
        path: 'mylikes',
        component: () => import('@/pages/mylikes.vue'),
      },
      {
        path: 'mystars',
        component: () => import('@/pages/mystars.vue'),
      },


      ////////////////////// OTHER
      {
        path: 'user/:userId',
        component: () => import('@/pages/other.vue'),
        props: true
      },


    ],
  },
  {
    path: '/',
    component: () => import('@/layouts/blank.vue'),
    children: [
      {
        path: 'login',
        component: () => import('@/pages/login.vue'),
      },
      {
        path: 'logout',
        component: () => import('@/pages/logout.vue'),
      },
      {
        path: 'register',
        component: () => import('@/pages/register.vue'),
      },
      {
        path: '/:pathMatch(.*)*',
        component: () => import('@/pages/[...error].vue'),
      },
    ],
  },

  {
    path: '/admin',
    component: () => import('@/layouts/default.vue'),
    children: [
    // {
    //   path: '',
    //   component: () => import('@/k_views/admin/Admin.vue')
    // },
    {
      path: 'adminpost',
      component: () => import('@/k_views/admin/AdminPost.vue'),
    },
    {
      path: 'adminwiki',
      component: () => import('@/k_views/admin/AdminWiki.vue')
    },
    {
      path: 'adminuser',
      component: () => import('@/k_views/admin/AdminUser.vue')
    },
    {
      path: 'admintable',
      component: () => import('@/k_views/admin/AdminTable.vue')
    },
  ]
  }

]

export default routes
