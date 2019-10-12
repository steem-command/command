import Manage from "@/views/Manage/Index";
import ManageMenu from "@/views/Manage/Menu";

export default {
  routes: [
    {
      path: "/manage",
      component: Manage,
      children: [
        {
          path: "",
          component: ManageMenu,
          meta: {
            title: "Manage your Steem account - Steem Command",
            metaTags: [
              {
                name: "description",
                content:
                  "Manage your Steem account's shared auth, witnesses, delegation, cast and other variables."
              },
              {
                property: "og:description",
                content:
                  "Manage your Steem account's shared auth, witnesses, delegation, cast and other variables."
              }
            ]
          }
        },
        {
          path: "cast",
          component: () =>
            import(
              /* webpackChunkName: "manageCast" */ "@views/Manage/Cast.vue"
            ),
          meta: {
            requiresAuth: true,
            title: "Cast account - Steem Command",
            metaTags: [
              {
                name: "description",
                content:
                  "Cast your account type as account, app, publisher, curator, witness, or bot."
              },
              {
                property: "og:description",
                content:
                  "Cast your account type as account, app, publisher, curator, witness, or bot."
              }
            ]
          }
        },
        {
          path: "delegation",
          component: () =>
            import(
              /* webpackChunkName: "manageMetaData" */ "@views/Manage/Delegation.vue"
            ),
          meta: {
            requiresAuth: true,
            title: "Manage account's delegations - Steem Command",
            metaTags: [
              {
                name: "description",
                content:
                  "View and manage your your Steem account's Steem Power delegations."
              },
              {
                property: "og:description",
                content:
                  "View and manage your your Steem account's Steem Power delegations."
              }
            ]
          }
        },
        {
          path: "auth",
          component: () =>
            import(
              /* webpackChunkName: "manageAuth" */ "@views/Manage/Auth.vue"
            ),
          meta: {
            requiresAuth: true,
            title: "Manage account auth - Steem Command",
            metaTags: [
              {
                name: "description",
                content:
                  "Explore and manage your Steem account's shared posting, active and owner auth."
              },
              {
                property: "og:description",
                content:
                  "Explore and manage your Steem account's shared posting, active and owner auth."
              }
            ]
          }
        },
        {
          path: "witness",
          component: () =>
            import(
              /* webpackChunkName: "manageWitness" */ "@views/Manage/Witness.vue"
            ),
          meta: {
            requiresAuth: true,
            title: "Manage witnesses - Steem Command",
            metaTags: [
              {
                name: "description",
                content: "Explore and manage your Steem account's witnesses."
              },
              {
                property: "og:description",
                content: "Explore and manage your Steem account's witnesses."
              }
            ]
          }
        },
        {
          path: "keys",
          component: () =>
            import(
              /* webpackChunkName: "manageKeys" */ "@views/Manage/Keys.vue"
            ),
          meta: {
            requiresAuth: true,
            title: "Manage keys - Steem Command",
            metaTags: [
              {
                name: "description",
                content: "Explore and manage your Steem account's keys."
              },
              {
                property: "og:description",
                content: "Explore and manage your Steem account's keys."
              }
            ]
          }
        }
      ]
    }
  ]
};
