import Store from "@store";

export default (to, from, next) => {
  if (to.matched.some(record => record.meta.requiresAuth)) {
    // only logged-in users!
    Store.dispatch("setPending", to.fullPath);
    if (Store.state.activated && !Store.state.loggedIn) {
      next({
        path: "/unlock"
      });
    } else if (!Store.state.activated && !Store.state.loggedIn) {
      next({
        path: "/login"
      });
    } else {
      next();
    }
  } else if (to.matched.some(record => record.meta.guest)) {
    // only non-loggedin users! no logged-in user
    if (Store.state.loggedIn === null) {
      next();
    } else {
      next({ path: "/" });
    }
  } else {
    next();
  }
};
