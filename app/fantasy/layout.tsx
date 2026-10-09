import type { Metadata } from "next";
import FantasyMenu from "./FantasyMenu";

export const metadata: Metadata = {
  title: "Fantasy Lab | BRHT",
  description: "Fantasy basketball tools.",
  robots: { index: false, follow: false, noarchive: true },
};

export default function FantasyLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="fantasy-shell min-h-screen bg-[#f5f5f7] text-[#1d1d1f]"
      style={{
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "Helvetica Neue", Arial, sans-serif',
      }}
    >
      <style>{`
        .fantasy-shell main > header nav { display: none !important; }
        .fantasy-shell main > header > div { justify-content: flex-start !important; }
        .fantasy-shell main > header > div > :nth-child(2) { margin-left: auto; }
      `}</style>
      <FantasyMenu />
      {children}
    </div>
  );
}
