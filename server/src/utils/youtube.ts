export interface YoutubeVideoRef {
  videoId: string;
  title: string;
  channelTitle: string;
  url: string;
}

/** Public shape for APIs that only need title + URL. */
export type YoutubeResourceLink = {
  title: string;
  url: string;
  channelTitle?: string;
  videoId?: string;
};

/** YouTube Data API v3 search — requires API key with YouTube Data API v3 enabled. */
export async function searchYoutubeVideos(
  apiKey: string,
  query: string,
  maxResults: number,
): Promise<YoutubeVideoRef[]> {
  const safeMax = Math.min(Math.max(1, maxResults), 5);
  const url = new URL("https://www.googleapis.com/youtube/v3/search");
  url.searchParams.set("part", "snippet");
  url.searchParams.set("type", "video");
  url.searchParams.set("maxResults", String(safeMax));
  url.searchParams.set("safeSearch", "moderate");
  url.searchParams.set("q", query.slice(0, 300));
  url.searchParams.set("key", apiKey);

  const res = await fetch(url);
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`YouTube API HTTP ${res.status}: ${body.slice(0, 240)}`);
  }

  const data = (await res.json()) as {
    items?: Array<{
      id?: { videoId?: string };
      snippet?: { title?: string; channelTitle?: string };
    }>;
  };

  const items = data.items ?? [];
  const out: YoutubeVideoRef[] = [];
  for (const i of items) {
    const id = i.id?.videoId;
    if (!id) continue;
    out.push({
      videoId: id,
      title: i.snippet?.title ?? "Video",
      channelTitle: i.snippet?.channelTitle ?? "",
      url: `https://www.youtube.com/watch?v=${id}`,
    });
  }
  return out;
}

/**
 * Top videos for a prep topic, scoped by role context (used in search query).
 */
export async function getYoutubeResources(
  apiKey: string,
  topic: string,
  roleContext: string,
  maxResults: number,
): Promise<YoutubeResourceLink[]> {
  const combined = `${roleContext} ${topic}`.replace(/\s+/g, " ").trim().slice(0, 280);
  const raw = await searchYoutubeVideos(apiKey, combined, maxResults);
  return raw.map((v) => ({
    title: v.title,
    url: v.url,
    channelTitle: v.channelTitle,
    videoId: v.videoId,
  }));
}
