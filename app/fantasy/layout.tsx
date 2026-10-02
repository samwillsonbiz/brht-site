import type { Metadata } from "next";
import FantasyMenu from "./FantasyMenu";

export const metadata: Metadata = {
  title: "Fantasy Basketball Forecast | BRHT",
  description:
    "Weekly fantasy basketball matchup forecasting, lineup optimization, and streaming planner.",
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
      <style>{`.fantasy-shell main > header { display: none !important; }`}</style>
      <FantasyMenu />
      {children}
    </div>
  );
}
