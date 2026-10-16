import type { Metadata } from "next";
import BabeEpisodeBrowser from "./episode-browser";
import { getBabeEpisodes } from "./episodes";

export const metadata: Metadata = {
  title: "All Episodes | Babe, What Do You Know About?",
  description: "Search and browse every episode of Babe, What Do You Know About? with Sam and Tayla. Discover conversations by topic, guest, or season.",
  alternates: { canonical: "https://www.brht.ai/babe/archive" },
  openGraph: {
    title: "The Episode Archive | Babe, What Do You Know About?",
    description: "Every rabbit hole. Every debate. Explore and search the episodes with Sam and Tayla.",
    url: "https://www.brht.ai/babe/archive",
    type: "website",
  },
};

export const dynamic = "force-dynamic";

export default async function BabeArchivePage() {
  const episodes = await getBabeEpisodes();
  return <BabeEpisodeBrowser episodes={episodes} />;
}
