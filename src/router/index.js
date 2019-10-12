import Vue from "vue";
import Router from "vue-router";
import routes from "./routes/index";
import guards from "./guards";

Vue.use(Router);

let router = new Router({
  mode: "history",
  base: process.env.BASE_URL,
  routes: routes.routes
});

router.beforeEach(guards);

export default router;
