<template>
  <div id="app">
    <div>
      <app-header></app-header>
    </div>
    <div class="app-body">
      <div class="container" style="margin: auto">
        <router-view />
      </div>
    </div>
    <div>
      <app-footer></app-footer>
    </div>
  </div>
</template>

<script>
import AppHeader from "./components/partials/Header";
import AppFooter from "./components/partials/Footer";

export default {
  components: {
    AppHeader,
    AppFooter
  },
  data: function() {
    return {
      authenticated: false
    };
  },
  async created() {
    await this.$store.dispatch("loadProps");
    await this.$store.dispatch("loadAccounts");

    //  [App.vue specific] When App.vue is first loaded start the progress bar
    this.$Progress.start();
    //  hook the progress bar to start before we move router-view
    this.$router.beforeEach((to, from, next) => {
      //  does the page we want to go to have a meta.progress object
      if (to.meta.progress !== undefined) {
        let meta = to.meta.progress;
        // parse meta tags
        this.$Progress.parseMeta(meta);
      }
      //  start the progress bar
      this.$Progress.start();
      //  continue to next page
      next();
    });
    //  hook the progress bar to finish after we've finished moving router-view
    /* eslint no-unused-vars: ["error", { "args": "none" }] */
    this.$router.afterEach((to, from) => {
      //  finish the progress bar
      this.$Progress.finish();
    });
  },
  mounted() {
    //check for Steem Connect plugin and try to auth
    // if () this.authenticated = true
    //  [App.vue specific] When App.vue is finish loading finish the progress bar
    this.$Progress.finish();

    // This callback runs before every route change, including on page load.

    this.$router.beforeEach((to, from, next) => {
      // This goes through the matched routes from last to first, finding the closest route with a title.
      // eg. if we have /some/deep/nested/route and /some, /deep, and /nested have titles, nested's will be chosen.
      const nearestWithTitle = to.matched
        .slice()
        .reverse()
        .find(r => r.meta && r.meta.title);

      // Find the nearest route element with meta tags.
      const nearestWithMeta = to.matched
        .slice()
        .reverse()
        .find(r => r.meta && r.meta.metaTags);
      // const previousNearestWithMeta = from.matched.slice().reverse().find(r => r.meta && r.meta.metaTags)

      // If a route with a title was found, set the document (page) title to that value.
      if (nearestWithTitle) document.title = nearestWithTitle.meta.title;

      // Remove any stale meta tags from the document using the key attribute we set below.
      Array.from(document.querySelectorAll("[data-vue-router-controlled]")).map(
        el => el.parentNode.removeChild(el)
      );

      // Skip rendering meta tags if there are none.
      if (!nearestWithMeta) return next();

      // Turn the meta tag definitions into actual elements in the head.
      nearestWithMeta.meta.metaTags
        .map(tagDef => {
          const tag = document.createElement("meta");

          Object.keys(tagDef).forEach(key => {
            tag.setAttribute(key, tagDef[key]);
          });

          // We use this to track which meta tags we create, so we don't interfere with other ones.
          tag.setAttribute("data-vue-router-controlled", "");

          return tag;
        })
        // Add the meta tags to the document head.
        .forEach(tag => document.head.appendChild(tag));

      next();
    });

    //update gprops every 1 minute

    this.$store.dispatch("loadGprops");
    setInterval(() => {
      this.$store.dispatch("loadGprops");
    }, 60 * 1000);
  }
};
</script>

<style lang="scss"></style>
