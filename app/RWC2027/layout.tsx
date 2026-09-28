import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "RWC 2027 Tickets | Family & Friends",
  description:
    "View Rugby World Cup 2027 matches, seats, prices, assignments and payment status for our family and friends group.",
};

export default function Rwc2027Layout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return children;
}
