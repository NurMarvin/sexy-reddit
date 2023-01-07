import { Hono } from "hono";
import { logger } from "hono/logger";
import { etag } from "hono/etag";
import { StatusCode } from "hono/utils/http-status";
import { RequestData, Toucan } from "toucan-js";

import { StatusError } from "./types/cloudflare";
import { addIndexRoutes } from "./routes";
import { addEmbedRoutes } from "./routes/embed";
import { addRedditRoutes } from "./routes/reddit";

const app = new Hono();

app.use("*", etag(), logger());

addIndexRoutes(app);
addEmbedRoutes(app);
addRedditRoutes(app);

const errorCommment = `It seems like something went wrong when we were trying to get information about this Reddit post. We've already recorded the error and will try to fix it as soon as possible. Please try again later.`;

app.notFound(() => {
  throw new StatusError(404);
});

app.onError((err, c) => {
  if (err instanceof StatusError) {
    c.status(<StatusCode>err.status);
  } else {
    console.error(err);
    c.status(500);
  }

  if (c.env.SENTRY_DSN) {
    try {
      const sentry = new Toucan({
        dsn: c.env.SENTRY_DSN,
        context: c.executionCtx,
        integrations: [
          new RequestData({
            allowedHeaders: ["User-Agent"],
            allowedSearchParams: /(.*)/,
          }),
        ],
      });

      sentry.captureException(err);
    } catch (e) {
      console.error("Failed to send error to Sentry", e);
    }
  }

  return c.json({
    _comment: errorCommment,
    error: err.message,
    success: false,
  });
});

export default app;
