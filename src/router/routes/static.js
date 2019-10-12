import Prompt from "@/views/Static/Prompt";

export default {
  routes: [
    {
      path: "/",
      name: "prompt",
      component: Prompt,
      meta: {
        title: "Explore, build and sign transactions on Steem Command prompt",
        metaTags: [
          {
            name: "description",
            content:
              "Explore, manage and command your Steem account, explore, build and sign transactions on Steem Command prompt."
          },
          {
            property: "og:description",
            content:
              "Explore, manage and command your Steem account, explore, build and sign transactions on Steem Command prompt."
          }
        ]
      }
    },
    {
      path: "/about",
      name: "about",
      component: () =>
        import(/* webpackChunkName: "about" */ "@views/Static/About.vue"),
      meta: {
        title: "About - Steem Command",
        metaTags: [
          {
            name: "description",
            content:
              "Steem Command is your open source Steem Command interface by Steem Inc. Learn more about us."
          },
          {
            property: "og:description",
            content:
              "Steem Command is your open source Steem Command interface by Steem Inc. Learn more about us."
          }
        ]
      }
    },
    {
      path: "/privacy",
      name: "privacy",
      component: () =>
        import(/* webpackChunkName: "privacy" */ "@views/Static/Privacy.vue"),
      meta: {
        title: "Privacy Policy - Steem Command",
        metaTags: [
          {
            name: "description",
            content:
              "We neither track or monitor your activities. We do NOT transfer any of your KEYS or data to any serves, learn more."
          },
          {
            property: "og:description",
            content:
              "We neither track or monitor your activities. We do NOT transfer any of your KEYS or data to any serves, learn more."
          }
        ]
      }
    },
    {
      path: "/terms",
      name: "terms",
      component: () =>
        import(/* webpackChunkName: "terms" */ "@views/Static/Terms.vue"),
      meta: {
        title: "Terms of Service - Steem Command",
        metaTags: [
          {
            name: "description",
            content:
              "FREE OPEN SOURCE SOFTWARE: NO SUPPORT AND NO WARRANTY. MIT license, learn more."
          },
          {
            property: "og:description",
            content:
              "FREE OPEN SOURCE SOFTWARE: NO SUPPORT AND NO WARRANTY. MIT license, learn more."
          }
        ]
      }
    }
  ]
};
