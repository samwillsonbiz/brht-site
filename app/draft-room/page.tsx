import type { Metadata } from "next";
import LiveDraftPage from "@/app/fantasy/draft/live/page";

export const metadata: Metadata = {
  title: "Draft Room | Fantasy Lab",
  description: "Private-use fantasy basketball draft board.",
  robots: { index: false, follow: false, noarchive: true },
};

/**
 * Standalone shortcut to the existing Draft Room.
 * This does not unlock /fantasy or any of the restricted /api/fantasy routes.
 * The app keeps its original localStorage draft markings.
 */
export default function DraftRoomPage() {
  return (
    <div
      className="fantasy-shell min-h-screen bg-[#f5f5f7] text-[#1d1d1f]"
      style={{
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "Helvetica Neue", Arial, sans-serif',
      }}
    >
      <LiveDraftPage apiBase="/api/draft-room" />
    </div>
  );
}
