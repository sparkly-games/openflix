import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/_index.tsx"),
  route("search", "routes/search.tsx"),
  route("movie/:id", "routes/movie-details.tsx"),
  route("login", "routes/login.tsx"),
  route("profiles", "routes/profiles.tsx"),
  route("list", "routes/list.tsx"),
] satisfies RouteConfig;