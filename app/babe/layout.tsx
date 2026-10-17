import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Bricolage_Grotesque, Fraunces, DM_Sans } from "next/font/google";
import "./babe.css";

const display = Bricolage_Grotesque({ subsets: ["latin"], weight: "800", variable: "--babe-display", display: "swap" });
const serif = Fraunces({ subsets: ["latin"], weight: "600", style: "italic", variable: "--babe-serif", display: "swap" });
const body = DM_Sans({ subsets: ["latin"], variable: "--babe-body", display: "swap" });

export const metadata: Metadata = {
  title: "Babe, What Do You Know About? | Sam & Tayla",
  description: "Two voices meeting in the middle. Honest conversations, different takes and curious questions with Sam and Tayla. Listen, follow and join the conversation.",
  alternates: { canonical: "https://www.brht.ai/babe" },
  openGraph: { title: "Babe, What Do You Know About?", description: "Two voices meeting in the middle. The podcast with Sam and Tayla.", url: "https://www.brht.ai/babe", siteName: "Babe, What Do You Know About?", type: "website" },
};

export default function BabeLayout({children}:{children:ReactNode}) {
  return <div className={`babe-shell ${display.variable} ${serif.variable} ${body.variable}`}>{children}</div>;
}
