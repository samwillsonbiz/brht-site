import type { CSSProperties } from "react";

export function BrandMark({ size = 70 }: { size?: number }) {
  return <svg width={size} height={size * .8} viewBox="0 0 200 160" role="img" aria-label="Overlapping coral and teal speech bubbles">
    <path d="M44 116 L26 150 L72 128 Z" fill="#E8665A" />
    <circle cx="80" cy="74" r="56" fill="#E8665A" />
    <path d="M156 116 L174 150 L128 128 Z" fill="#237573" />
    <circle cx="120" cy="74" r="56" fill="#237573" />
    <path d="M100 21.69 A56 56 0 0 1 100 126.31 A56 56 0 0 1 100 21.69 Z" fill="#5C3A3F" />
  </svg>;
}

function Diamond() {
  return <span aria-hidden="true" style={{ display: "inline-block", width: 0, height: "0.175em", verticalAlign: "0.444em", position: "relative", overflow: "visible" }}>
    <svg viewBox="-10.5 30 21 24" style={{ position: "absolute", left: "-0.26em", bottom: 0, width: "0.26em", height: "0.175em", overflow: "visible" }}>
      <path d="M-5 31 H5 L10 37 L0 53 L-10 37 Z" fill="#237573" stroke="#237573" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M-10 37 H10 M-5 31 L-2.5 37 L0 53 L2.5 37 L5 31" fill="none" stroke="#CFE8E1" strokeWidth="1.1" strokeLinejoin="round" />
    </svg>
  </span>;
}

export function Wordmark({ size = 46, dark = false, showTagline = true }: { size?: number; dark?: boolean; showTagline?: boolean }) {
  const ink = dark ? "#FAF5EE" : "#1F1B24";
  const textStyle: CSSProperties = { fontFamily: "var(--babe-serif), Georgia, serif", fontStyle: "italic", fontWeight: 600, fontSize: size, lineHeight: .9, letterSpacing: "-.02em", color: ink, fontVariationSettings: '"opsz" 144', whiteSpace: "nowrap" };
  return <span style={{ display: "inline-flex", flexDirection: "column", alignItems: "flex-start", gap: size * .08 }}>
    <span style={textStyle}>Ba<Diamond/>be<span style={{ color: "#E8665A", marginLeft: ".07em" }}>,</span></span>
    {showTagline && <span style={{ fontFamily: "var(--babe-display), sans-serif", fontWeight: 800, fontSize: Math.round(size * .3), lineHeight: 1, letterSpacing: "-.01em", color: ink, whiteSpace: "nowrap" }}>what do you know about<span style={{ color: "#F2B544", marginLeft: ".3em" }}>?</span></span>}
  </span>;
}

export function BabeLogo({ small = false, dark = false }: { small?: boolean; dark?: boolean }) {
  return <span className="inline-flex items-center gap-1.5 sm:gap-3" aria-label="Babe, what do you know about?">
    <BrandMark size={small ? 46 : 62} />
    <Wordmark size={small ? 34 : 41} dark={dark} />
  </span>;
}
