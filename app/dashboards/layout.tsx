import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    default: "Dashboards | BRHT",
    template: "%s | BRHT Dashboards",
  },
  description: "Private BRHT operating dashboards.",
  robots: {
    index: false,
    follow: false,
    noarchive: true,
    nocache: true,
  },
};

export default function DashboardsLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return children;
}
