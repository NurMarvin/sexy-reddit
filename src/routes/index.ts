import { Hono } from "hono";

export const addIndexRoutes = (app: Hono) => {
  app.get("/", (c) => c.redirect("https://nurmarv.in"));
};
