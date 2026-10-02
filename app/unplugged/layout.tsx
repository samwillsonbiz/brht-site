import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "UNPLUGGED — See what's happening. Not what you're fed.",
  description:
    "An ad-free front page of the internet showing what's trending, how conversation is moving, and how people feel across communities.",
};

export default function UnpluggedLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
