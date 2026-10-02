export type SourceSignal = {
  source: string;
  detail: string;
  url?: string;
  items?: number;
  comments?: number;
  views?: number;
};

export type CanonicalTopic = {
  title: string;
  query: string;
  description?: string;
  attention?: number;
  sources?: SourceSignal[];
};

export function topicSlug(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 90) || "topic";
}

export function topicHref(topic: CanonicalTopic) {
  const params = new URLSearchParams();
  params.set("q", topic.query || topic.title);
  params.set("title", topic.title);
  if (topic.description) params.set("description", topic.description.slice(0, 500));
  if (typeof topic.attention === "number") params.set("attention", String(topic.attention));
  const sources = (topic.sources ?? []).slice(0, 8);
  if (sources.length) params.set("sources", JSON.stringify(sources));
  return `/outside-the-feed/topic/${topicSlug(topic.title)}?${params.toString()}`;
}

export function parseTopicSources(value: string | null): SourceSignal[] {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    if (!Array.isArray(parsed)) return [];
    return parsed.slice(0, 8).flatMap((source) => {
      if (!source || typeof source !== "object" || typeof source.source !== "string") return [];
      return [{
        source: source.source,
        detail: typeof source.detail === "string" ? source.detail : "",
        url: typeof source.url === "string" ? source.url : undefined,
        items: typeof source.items === "number" ? source.items : undefined,
        comments: typeof source.comments === "number" ? source.comments : undefined,
        views: typeof source.views === "number" ? source.views : undefined,
      }];
    });
  } catch {
    return [];
  }
}
