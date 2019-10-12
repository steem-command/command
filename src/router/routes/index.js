import authRoutes from "./auth";
import manageRoutes from "./manage";
import exploreRoutes from "./explore";
import signRoutes from "./sign";
import staticRoutes from "./static";

export default {
  routes: [
    ...authRoutes.routes,
    ...manageRoutes.routes,
    ...exploreRoutes.routes,
    ...signRoutes.routes,
    ...staticRoutes.routes
  ]
};
