export type BabeEpisode = {
  id: string;
  title: string;
  description: string;
  date: string;
  season: number | null;
  number: number | null;
  duration: string;
  link: string;
};

const FEED_URL = "https://feeds.buzzsprout.com/2041257.rss";
export const PODCAST_ARCHIVE_URL = "https://www.buzzsprout.com/2041257/episodes";

function decodeEntities(text: string): string {
  const named: Record<string, string> = {
    amp: "&", quot: '"', apos: "'", lt: "<", gt: ">", nbsp: " ",
    rsquo: "’", lsquo: "‘", ldquo: "“", rdquo: "”", mdash: "—", ndash: "–", hellip: "…",
  };
  return text.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (entity, name: string) => {
    const normalized = name.toLowerCase();
    if (normalized.startsWith("#")) {
      const hex = normalized.startsWith("#x");
      const codepoint = parseInt(normalized.slice(hex ? 2 : 1), hex ? 16 : 10);
      return codepoint > 0 && codepoint <= 0x10ffff ? String.fromCodePoint(codepoint) : entity;
    }
    return named[normalized] ?? entity;
  });
}

function xmlValue(item: string, name: string): string {
  // Podcast tag names are controlled values, never user-supplied regex fragments.
  const match = item.match(new RegExp("<" + name + "(?:\\s[^>]*)?>([\\s\\S]*?)<\\/" + name + ">", "i"));
  return match?.[1]?.trim() ?? "";
}

function plainText(value: string): string {
  return decodeEntities(value
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim());
}

function parseFeed(xml: string): BabeEpisode[] {
  const items = [...xml.matchAll(/<item\b[^>]*>([\s\S]*?)<\/item>/gi)];
  const episodes = items.map(([, item], i) => {
    const title = plainText(xmlValue(item, "title"));
    const dateRaw = plainText(xmlValue(item, "pubDate"));
    const parsedDate = new Date(dateRaw);
    const linkRaw = plainText(xmlValue(item, "link"));
    const link = /^https:\/\/([a-z0-9-]+\.)*buzzsprout\.com\//i.test(linkRaw) ? linkRaw : PODCAST_ARCHIVE_URL;
    const numberRaw = Number(plainText(xmlValue(item, "itunes:episode")));
    const seasonRaw = Number(plainText(xmlValue(item, "itunes:season")));
    return {
      id: plainText(xmlValue(item, "guid")) || linkRaw || String(i),
      title,
      description: plainText(xmlValue(item, "description") || xmlValue(item, "itunes:summary")).slice(0, 700),
      date: Number.isNaN(parsedDate.getTime()) ? "" : parsedDate.toISOString(),
      number: Number.isInteger(numberRaw) && numberRaw > 0 ? numberRaw : null,
      season: Number.isInteger(seasonRaw) && seasonRaw > 0 ? seasonRaw : null,
      duration: plainText(xmlValue(item, "itunes:duration")),
      link,
    };
  }).filter(e => !!e.title);
  episodes.sort((a, b) => (b.date || "").localeCompare(a.date || ""));
  return episodes;
}

export async function getBabeEpisodes(): Promise<BabeEpisode[]> {
  try {
    const response = await fetch(FEED_URL, {
      next: { revalidate: 3600 },
      headers: { Accept: "application/rss+xml, application/xml, text/xml" },
      signal: AbortSignal.timeout(10000),
    });
    if (!response.ok) throw new Error("RSS request failed: " + response.status);
    const xml = await response.text();
    const items = parseFeed(xml);
    if (!items.length) throw new Error("RSS feed returned no episodes");
    return items;
  } catch (error) {
    console.error("Babe podcast archive feed unavailable", error instanceof Error ? error.message : "Unknown error");
    return [];
  }
}
