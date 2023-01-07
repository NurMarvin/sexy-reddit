import { RedditPost, RedditResponse } from "@/types/reddit";
import { APIClient } from "./client";

class RedditAPI extends APIClient {
  constructor() {
    super("https://www.reddit.com");
  }

  async getCacheId(): Promise<string> {
    return "reddit";
  }

  async getHeaders(): Promise<Record<string, string>> {
    return {
      "User-Agent": "Cloudflare Workers",
    };
  }

  async getPost(id: string): Promise<RedditPost> {
    const res = await this.get<RedditResponse>(`/comments/${id}.json`);
    return res[0].data.children[0];
  }
}

export const reddit = new RedditAPI();
