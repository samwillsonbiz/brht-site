import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cecilia’s | The Art of Natural Beauty — Storefront Concept",
  description: "A proposed botanical skincare and essential oils storefront for Cecilia’s Products. Explore thoughtful routines, founder-led skincare and a premium shopping experience.",
  robots: { index: false, follow: false },
  openGraph: {
    title: "Cecilia’s — The Art of Natural Beauty",
    description: "An interactive storefront redesign concept for Cecilia’s Products.",
    type: "website",
  },
};

import {StoreProvider} from "./commerce";
import {StoreHeader,StoreFooter,CartDrawer} from "./commerce-ui";
import s from "./commerce.module.css";

export default function CeciliaLayout({ children }: Readonly<{children: React.ReactNode}>) {
  return <StoreProvider><div className={s.store}>
    <StoreHeader/>
    {children}
    <StoreFooter/>
    <CartDrawer/>
  </div></StoreProvider>;
}
