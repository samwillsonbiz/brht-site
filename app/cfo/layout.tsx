import type { Metadata } from "next";
import CfoTeamPolish from "@/components/CfoTeamPolish";

export const metadata: Metadata = {
  title: "BRHT CFO | Strategic CFO Advisory",
  description:
    "Outsourced CFO advisory for growing companies that need clearer financial insights, stronger forecasting, better reporting, and strategic financial guidance.",
};

export default function CfoLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      {children}
      <CfoTeamPolish />
    </>
  );
}
