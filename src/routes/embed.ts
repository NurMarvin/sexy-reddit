import { Hono } from "hono";
import { StatusError } from "@/types/cloudflare";

export const addEmbedRoutes = (app: Hono) => {
  app.get("/internal/embed", async (c) => {
    const username = c.req.query("username");
    if (!username) throw new StatusError(400, "Missing username");

    const subreddit = c.req.query("subreddit");
    if (!subreddit) throw new StatusError(400, "Missing subreddit");

    return c.json({
      author_name: `u/${username} on r/${subreddit}`,
      author_url: `https://reddit.com/u/${username}`,
      provider_name: "SexyReddit - Embed using s/e/xy",
      provider_url: "https://github.com/NurMarvin/sexy-reddit",
      title: "Reddit Embed",
      type: "link",
      version: "1.0",
    });
  });
};
