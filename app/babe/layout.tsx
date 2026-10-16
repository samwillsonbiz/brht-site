import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Babe, What Do You Know About? | Sam & Tayla",
  description: "The podcast, the people, and everything in between. Two married people, a lot of opinions, and conversations about life, culture, and big ideas. Listen and join Sam & Tayla.",
  alternates: { canonical: "https://www.brht.ai/babe" },
  openGraph: {
    title: "Babe, What Do You Know About?",
    description: "Same team. Different takes. Join Sam and Tayla for the conversations worth having.",
    url: "https://www.brht.ai/babe",
    siteName: "Babe, What Do You Know About?",
    type: "website",
  },
  robots: { index: true, follow: true },
};

export default function BabeLayout({ children }: { children: ReactNode }) {
  return children;
}
