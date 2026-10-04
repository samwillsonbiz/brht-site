import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "BRHT Solar | Custom Solar Installation Projects",
  description:
    "Custom solar, battery and energy projects designed around the property, real energy use, resilience and future loads.",
};

export default function SolarLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
