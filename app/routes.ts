import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("robots.txt", "routes/robots.txt.ts"),
  route("admin/login", "routes/admin.login.tsx"),
  route("admin/logout", "routes/admin.logout.ts"),
  route("admin", "routes/admin.tsx", [
    index("routes/admin.index.tsx"),
    route("categories", "routes/admin.categories.tsx"),
    route("categories/new", "routes/admin.categories.new.tsx"),
    route("categories/:id", "routes/admin.categories.$id.tsx"),
    route("products", "routes/admin.products.tsx"),
    route("homepage", "routes/admin.homepage.tsx"),
    route("settings/contact", "routes/admin.settings.contact.tsx"),
  ]),
] satisfies RouteConfig;
