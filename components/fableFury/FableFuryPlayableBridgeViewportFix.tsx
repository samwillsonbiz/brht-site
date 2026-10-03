"use client";

import FableFuryPlayableBridge from "@/components/fableFury/FableFuryPlayableBridge";

export default function FableFuryPlayableBridgeViewportFix() {
  return (
    <>
      <FableFuryPlayableBridge />
      <style jsx global>{`
        [class*="z-[950]"] {
          overflow-y: auto !important;
          align-items: center !important;
          padding-top: 1.25rem !important;
          padding-bottom: 1.25rem !important;
        }
        [class*="z-[950]"] > div {
          max-width: 100% !important;
        }
        [class*="z-[950]"] img {
          width: auto !important;
          max-width: min(68vw, 560px) !important;
          max-height: 55vh !important;
          object-fit: contain !important;
        }
        @media (max-height: 820px) {
          [class*="z-[950]"] img {
            max-height: 48vh !important;
            max-width: min(62vw, 500px) !important;
          }
          [class*="z-[950]"] h1 {
            font-size: clamp(2rem, 5vw, 3.4rem) !important;
          }
        }
        @media (max-width: 700px) {
          [class*="z-[950]"] img {
            max-width: 82vw !important;
            max-height: 52vh !important;
          }
        }
      `}</style>
    </>
  );
}
