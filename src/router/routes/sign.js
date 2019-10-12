import Sign from "@/views/Sign/Index";
import SignMenu from "@/views/Sign/Menu";

export default {
  routes: [
    {
      path: "/sign",
      component: Sign,
      children: [
        {
          path: "",
          component: SignMenu,
          meta: {
            title: "Build and sign transactions - Steem Command",
            metaTags: [
              {
                name: "description",
                content:
                  "Build and sign different types of transactions on Steem Command prompt."
              },
              {
                property: "og:description",
                content:
                  "Build and sign different types of transactions on Steem Command prompt."
              }
            ]
          }
        },
        {
          path: "op*",
          component: () =>
            import(/* webpackChunkName: "signOp" */ "@views/Sign/Sign.vue")
        },
        {
          path: ":op",
          component: () =>
            import(/* webpackChunkName: "signNew" */ "@views/Sign/New.vue")
        }
      ]
    }
  ]
};
