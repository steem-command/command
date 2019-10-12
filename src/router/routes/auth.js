export default {
  routes: [
    {
      path: "/login",
      component: () =>
        import(/* webpackChunkName: "login" */ "@views/Auth/Login.vue"),
      meta: {
        title: "Secure login - Steem Command",
        metaTags: [
          {
            name: "description",
            content: "Securely log in."
          },
          {
            property: "og:description",
            content: "Securely log in."
          }
        ]
      }
    },
    {
      path: "/lock",
      component: () =>
        import(/* webpackChunkName: "lock" */ "@views/Auth/Lock.vue")
    },
    {
      path: "/unlock",
      component: () =>
        import(/* webpackChunkName: "unlock" */ "@views/Auth/Unlock.vue")
    },
    {
      path: "/logout",
      component: () =>
        import(/* webpackChunkName: "logout" */ "@views/Auth/Logout.vue")
    }
  ]
};
