import { Fragment, jsx } from "hono/jsx";

import { Constants } from "@/constants";
import { RedditPost } from "@/types/reddit";
import { formatNumber } from "@/util/numbers";
import { Context, Handler, Hono } from "hono";
import { reddit } from "@/util/reddit";
import { StatusError } from "@/types/cloudflare";

const DiscordEmbed = ({ post }: { post: RedditPost }) => {
  let previewComponent: any;

  switch (post.data.post_hint) {
    case "image":
      previewComponent = <ImagePreview post={post} />;
      break;
    default:
      previewComponent = <TextPreview post={post} />;
      break;
  }

  return (
    <html lang="en">
      <head>
        <meta property="og:title" content={`${post.data.title}`} />
        <meta property="og:site_name" content="s/e/xy Reddit" />
        <meta property="og:url" content={post.data.url} />
        <meta property="theme-color" content="#FF4500" />

        {previewComponent}

        <link
          rel="alternate"
          href={`${Constants.HOST_URL}/internal/embed?username=${post.data.author}&subreddit=${post.data.subreddit}`}
          type="application/json+oembed"
        />
      </head>
    </html>
  );
};

const ImagePreview = ({ post }: { post: RedditPost }) => {
  const image = post.data.preview?.images[0].source;
  const text = post.data.selftext || "";
  const formattedUpvotes = formatNumber(post.data.ups, 1);
  const formattedComments = formatNumber(post.data.num_comments, 1);

  if (!image) return null;

  const description = `${text.slice(0, 200)}${
    text.length > 200 ? "..." : ""
  }\n\n⬆️ ${formattedUpvotes} Upvotes | 💬  ${formattedComments} Comments`;

  return (
    <Fragment>
      <meta property="og:description" content={description} />
      <meta property="og:image" content={post.data.url} />
      <meta property="og:image:type" content={`image/jpeg`} />
      <meta property="og:image:width" content={image.width.toString()} />
      <meta property="og:image:height" content={image.height.toString()} />
      <meta property="og:type" content="image.other" />
      <meta property="twitter:card" content="summary_large_image" />
    </Fragment>
  );
};

const TextPreview = ({ post }: { post: RedditPost }) => {
  const text = post.data.selftext;

  if (!text) return null;

  const formattedUpvotes = formatNumber(post.data.ups, 1);
  const formattedComments = formatNumber(post.data.num_comments, 1);
  const description = `${text.slice(0, 200)}${
    text.length > 200 ? "..." : ""
  }\n\n⬆️ ${formattedUpvotes} Upvotes | 💬 ${formattedComments} Comments`;

  return (
    <Fragment>
      <meta property="og:description" content={description} />
      <meta property="og:type" content="article" />
      <meta property="twitter:card" content="summary" />
    </Fragment>
  );
};

export const addRedditRoutes = (app: Hono) => {
  const render = (c: Context, post: RedditPost) => {
    const raw = c.req.query("raw") === "true";

    if (c.req.header("User-Agent")?.includes("Discordbot/2.0") && !raw) {
      return c.html(<DiscordEmbed post={post} />);
    }

    if (raw) {
      return c.redirect(post.data.url);
    }

    return c.redirect(`https://www.reddit.com${post.data.permalink}`);
  };

  // @ts-ignore
  const handler: Handler = async (c: Context) => {
    const id = c.req.param("id");

    const data = await reddit.getPost(id);
    if (!data) throw new StatusError(404, "Post not found");

    return render(c, data);
  };

  app.get("/r/:subreddit/comments/:id/:title", handler);
  app.get("/r/:subreddit/comments/:id/:title/", handler);
};
