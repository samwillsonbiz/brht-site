import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "BRHT Intelligence — Business Intelligence, Automation & AI",
    template: "%s | BRHT Intelligence",
  },
  description:
    "BRHT connects scattered business systems into a custom intelligence layer: live dashboards, workflow automation and AI built around how your company actually operates.",
  metadataBase: new URL("https://www.brht.ai"),
  openGraph: {
    title: "BRHT Intelligence — Turn business data into an operating system",
    description:
      "Custom business intelligence, automation and AI systems built on your data, your logic and your domain.",
    url: "https://www.brht.ai",
    siteName: "BRHT Intelligence",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
