import type { Metadata } from "next";
import FantasyMenu from "./FantasyMenu";

export const metadata: Metadata = {
  title: "Fantasy Basketball Forecast | BRHT",
  description:
    "Weekly fantasy basketball matchup forecasting, lineup optimization, and streaming planner.",
};

export default function FantasyLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <FantasyMenu />
      {children}
    </>
  );
}
