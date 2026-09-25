export const BRHT_BOOKING_EVENT = "brht:open-booking";

export function openBrhtBooking() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(BRHT_BOOKING_EVENT));
  }
}
