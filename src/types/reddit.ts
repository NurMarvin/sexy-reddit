export type RedditPost = {
  kind: string;
  data: {
    id: string;
    title: string;
    thumbnail: string;
    url: string;
    permalink: string;
    is_video: boolean;
    ups: number;
    author: string;
    subreddit: string;
    preview?: {
      images: {
        source: ImagePreview;
        resolutions: ImagePreview[];
      }[];
    };
    post_hint?: string;
    selftext?: string;
    num_comments: number;
  };
};

export type RedditResponse = {
  kind: string;
  data: {
    children: RedditPost[];
    after: string;
    before: string;
  };
};

export type ImagePreview = {
  url: string;
  width: number;
  height: number;
};
