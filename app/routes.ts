import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/_index.tsx"),
  route("search", "routes/search.tsx"),
  route("movie/:id", "routes/movie-details.tsx"), // New route
] satisfies RouteConfig;