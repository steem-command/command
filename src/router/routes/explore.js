import Explore from "@/views/Explore/Index";
import ExploreMenu from "@/views/Explore/Menu";

export default {
  routes: [
    {
      path: "/explore",
      component: Explore,
      children: [
        {
          path: "",
          component: ExploreMenu,
          meta: {
            title: "Explore Steem data - Steem Command",
            metaTags: [
              {
                name: "description",
                content:
                  "Explore Steem account data, transactions, post, chain config, chain properties and more."
              },
              {
                property: "og:description",
                content:
                  "Explore Steem account data, transactions, post, chain config, chain properties and more."
              }
            ]
          }
        },

        // account

        {
          path: "account",
          component: () =>
            import(
              /* webpackChunkName: "exploreAccount" */ "@views/Explore/Account.vue"
            ),
          meta: {
            title: "Explore Steem sccount - Steem Command",
            metaTags: [
              {
                name: "description",
                content:
                  "Explore the raw data of a Steem account directly from the chain."
              },
              {
                property: "og:description",
                content:
                  "Explore the raw data of a Steem account directly from the chain."
              }
            ]
          }
        },
        {
          path: "account/:target",
          component: () =>
            import(
              /* webpackChunkName: "exploreAccount" */ "@views/Explore/Account.vue"
            ),
          meta: {
            title: "Explore Steem account - Steem Command"
          }
        },

        // network

        {
          path: "network",
          component: () =>
            import(
              /* webpackChunkName: "exploreNetwork" */ "@views/Explore/Network.vue"
            ),
          meta: {
            title: "Explore Steem network - Steem Command",
            metaTags: [
              {
                name: "description",
                content: "Explore the Steem network data."
              },
              {
                property: "og:description",
                content: "Explore the Steem network data."
              }
            ]
          }
        },
        {
          path: "network/:target",
          component: () =>
            import(
              /* webpackChunkName: "exploreNetwork" */ "@views/Explore/Network.vue"
            ),
          meta: {
            title: "Explore Steem network - Steem Command"
          }
        }

        // witness
      ]
    }
  ]
};
