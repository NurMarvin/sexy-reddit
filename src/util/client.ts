import { StatusError } from "@/types/cloudflare";

export abstract class APIClient {
  protected constructor(private readonly base: string) {}

  async getCacheId(): Promise<string> {
    return "";
  }

  abstract getHeaders(): Promise<Record<string, string>>;

  /**
   * Performs a GET request to an API.
   * This method automatically adds any headers to the request and
   * will cache the response for 1 hour.
   *
   * @param path The path to the endpoint
   */
  async get<T>(path: string): Promise<T> {
    const id = await this.getCacheId();
    const headers = await this.getHeaders();

    const cacheId = `${path.includes("?") ? "&" : "?"}cache_id=${id}`;
    const response = await fetch(`${this.base}${path}${cacheId}`, {
      method: "GET",
      headers: headers,
      cf: {
        cacheEverything: true,
        cacheTtlByStatus: {
          "200-299": 60 * 60,
          "400-499": 5,
          "500-599": 0,
        },
      },
    });

    if (response.status !== 200)
      throw new StatusError(response.status, await response.text());

    return response.json();
  }
}
