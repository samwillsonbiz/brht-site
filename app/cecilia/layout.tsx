import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cecilia’s | The Art of Natural Beauty — Storefront Concept",
  description: "A proposed botanical skincare and essential oils storefront for Cecilia’s Products. Explore thoughtful routines, founder-led skincare and a premium shopping experience.",
  robots: { index: false, follow: false },
  openGraph: {
    title: "Cecilia’s — The Art of Natural Beauty",
    description: "An interactive storefront redesign concept for Cecilia’s Products.",
    type: "website",
  },
};

export default function CeciliaLayout({ children }: Readonly<{children: React.ReactNode}>) {
  return children;
}
