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
  metadataBase: new URL("https://brht.ai"),
  title: {
    default: "BRHT | Business systems that work",
    template: "%s | BRHT",
  },
  description:
    "Samuel Willson connects business systems, trustworthy data, automation, practical AI and custom products so teams can see clearly and act with confidence.",
  applicationName: "BRHT",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_AU",
    siteName: "BRHT",
    title: "BRHT | Business systems that work",
    description:
      "Business analysis, data, automation and product implementation by Samuel Willson in Perth, Western Australia.",
    url: "https://brht.ai",
  },
  twitter: {
    card: "summary_large_image",
    title: "BRHT | Business systems that work",
    description:
      "Business analysis, data, automation and product implementation by Samuel Willson.",
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
