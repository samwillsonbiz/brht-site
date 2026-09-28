"use client";

import { useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  CheckCircle2,
  CircleDollarSign,
  Clock3,
  Info,
  MapPin,
  RefreshCw,
  Ticket as TicketIcon,
  Users,
} from "lucide-react";

type PaymentStatus = "Unpaid" | "Partial" | "Paid" | string;

type SeatTicket = {
  match: string;
  date: string;
  time: string;
  venue: string;
  section: string;
  row: string;
  seat: string;
  price: number;
  assignedTo: string;
  paymentStatus: PaymentStatus;
};

type TicketGroup = Omit<SeatTicket, "seat" | "assignedTo" | "paymentStatus"> & {
  seats: Array<string | number>;
};

const LIVE_SHEET_CSV_URL = process.env.NEXT_PUBLIC_RWC2027_CSV_URL;

const groups: TicketGroup[] = [
  {
    match: "Australia v Hong Kong China",
    date: "2027-10-01",
    time: "6:45 PM",
    venue: "Perth Stadium",
    section: "509",
    row: "4",
    seats: [31, 32],
    price: 275,
  },
  {
    match: "South Africa v Romania",
    date: "2027-10-17",
    time: "7:15 PM",
    venue: "Perth Stadium",
    section: "509",
    row: "12",
    seats: [47, 48, 49, 50, 51, 52, 53, 54, 55, 56],
    price: 50,
  },
  {
    match: "South Africa v Romania",
    date: "2027-10-17",
    time: "7:15 PM",
    venue: "Perth Stadium",
    section: "509",
    row: "13",
    seats: [47, 48, 49, 50, 51, 52, 53, 54, 55, 56],
    price: 50,
  },
  {
    match: "Round of 16 (4)",
    date: "2027-10-23",
    time: "6:45 PM",
    venue: "Perth Stadium",
    section: "509",
    row: "12",
    seats: [31, 32, 33, 34, 35, 36],
    price: 95,
  },
  {
    match: "Round of 16 (8)",
    date: "2027-10-24",
    time: "6:45 PM",
    venue: "Perth Stadium",
    section: "509",
    row: "11",
    seats: [34, 35, 36, 37, 38],
    price: 95,
  },
  {
    match: "Round of 16 (8)",
    date: "2027-10-24",
    time: "6:45 PM",
    venue: "Perth Stadium",
    section: "509",
    row: "12",
    seats: [31, 32, 33, 34, 35],
    price: 95,
  },
  {
    match: "Quarter-final 1",
    date: "2027-10-30",
    time: "4:45 PM",
    venue: "Stadium Australia",
    section: "109-1",
    row: "3",
    seats: [22, 23, 24, 25, 26, 27],
    price: 995,
  },
  {
    match: "Final",
    date: "2027-11-13",
    time: "8:00 PM",
    venue: "Stadium Australia",
    section: "602",
    row: "17",
    seats: [43, 44, 45, 46, 47, 48, 49, 50],
    price: 1295,
  },
  {
    match: "Final",
    date: "2027-11-13",
    time: "8:00 PM",
    venue: "Stadium Australia",
    section: "602",
    row: "18",
    seats: [50, 51],
    price: 1295,
  },
  {
    match: "Final",
    date: "2027-11-13",
    time: "8:00 PM",
    venue: "Stadium Australia",
    section: "605",
    row: "16",
    seats: [4],
    price: 2395,
  },
];

const fallbackTickets: SeatTicket[] = groups.flatMap((group) =>
  group.seats.map((seat) => ({
    match: group.match,
    date: group.date,
    time: group.time,
    venue: group.venue,
    section: group.section,
    row: group.row,
    seat: String(seat),
    price: group.price,
    assignedTo: "",
    paymentStatus: "Unpaid",
  })),
);

const matchupDetails: Record<string, string> = {
  "Australia v Hong Kong China": "Pool match",
  "South Africa v Romania": "Pool match",
  "Round of 16 (4)": "Teams TBD — knockout match",
  "Round of 16 (8)": "Teams TBD — knockout match",
  "Quarter-final 1": "Teams TBD — quarter-final",
  Final: "Teams TBD — Rugby World Cup Final",
};

function formatDate(date: string) {
  return new Intl.DateTimeFormat("en-AU", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(`${date}T12:00:00`));
}

function formatCurrency(value: number) {
  return `A$${value.toLocaleString("en-AU")}`;
}

function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];

    if (char === '"') {
      if (inQuotes && text[i + 1] === '"') {
        field += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (char === "," && !inQuotes) {
      row.push(field);
      field = "";
      continue;
    }

    if ((char === "\n" || char === "\r") && !inQuotes) {
      if (char === "\r" && text[i + 1] === "\n") i += 1;
      row.push(field);
      if (row.some((value) => value.trim() !== "")) rows.push(row);
      row = [];
      field = "";
      continue;
    }

    field += char;
  }

  if (field.length || row.length) {
    row.push(field);
    if (row.some((value) => value.trim() !== "")) rows.push(row);
  }

  return rows;
}

function ticketsFromCsv(text: string): SeatTicket[] {
  const rows = parseCsv(text);
  if (rows.length < 2) return [];

  const header = rows[0].map((value) => value.trim());
  const column = (name: string) => header.indexOf(name);
  const required = [
    "Match",
    "Date",
    "Time",
    "Venue",
    "Section",
    "Row",
    "Seat",
    "Ticket Price",
    "Assigned To",
    "Payment Status",
  ];

  if (required.some((name) => column(name) === -1)) return [];

  return rows.slice(1).flatMap((values) => {
    const match = values[column("Match")]?.trim();
    if (!match) return [];

    const rawPrice = values[column("Ticket Price")] ?? "0";
    const price = Number(rawPrice.replace(/[^0-9.-]/g, "")) || 0;

    return [
      {
        match,
        date: values[column("Date")]?.trim() ?? "",
        time: values[column("Time")]?.trim() ?? "",
        venue: values[column("Venue")]?.trim() ?? "",
        section: values[column("Section")]?.trim() ?? "",
        row: values[column("Row")]?.trim() ?? "",
        seat: values[column("Seat")]?.trim() ?? "",
        price,
        assignedTo: values[column("Assigned To")]?.trim() ?? "",
        paymentStatus: values[column("Payment Status")]?.trim() || "Unpaid",
      },
    ];
  });
}

function paymentClasses(status: string) {
  const normalized = status.toLowerCase();
  if (normalized === "paid") {
    return "border-emerald-400/25 bg-emerald-400/10 text-emerald-200";
  }
  if (normalized === "partial") {
    return "border-amber-300/25 bg-amber-300/10 text-amber-100";
  }
  return "border-rose-300/20 bg-rose-300/10 text-rose-100";
}

export default function Rwc2027Page() {
  const [tickets, setTickets] = useState<SeatTicket[]>(fallbackTickets);
  const [selectedMatch, setSelectedMatch] = useState("South Africa v Romania");
  const [source, setSource] = useState<"snapshot" | "live">("snapshot");
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (!LIVE_SHEET_CSV_URL) return;

    let cancelled = false;

    const load = async () => {
      try {
        setRefreshing(true);
        const separator = LIVE_SHEET_CSV_URL.includes("?") ? "&" : "?";
        const response = await fetch(
          `${LIVE_SHEET_CSV_URL}${separator}_=${Date.now()}`,
          { cache: "no-store" },
        );
        if (!response.ok) throw new Error("Sheet feed unavailable");
        const parsed = ticketsFromCsv(await response.text());
        if (!cancelled && parsed.length) {
          setTickets(parsed);
          setSource("live");
        }
      } catch {
        if (!cancelled) setSource("snapshot");
      } finally {
        if (!cancelled) setRefreshing(false);
      }
    };

    load();
    const interval = window.setInterval(load, 60_000);
    return () => {
      cancelled = true;
      window.clearInterval(interval);
    };
  }, []);

  const matches = useMemo(() => {
    const map = new Map<string, SeatTicket>();
    tickets.forEach((ticket) => {
      if (!map.has(ticket.match)) map.set(ticket.match, ticket);
    });
    return Array.from(map.values()).sort((a, b) =>
      `${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`),
    );
  }, [tickets]);

  useEffect(() => {
    if (!matches.some((match) => match.match === selectedMatch) && matches[0]) {
      setSelectedMatch(matches[0].match);
    }
  }, [matches, selectedMatch]);

  const selectedTickets = useMemo(
    () =>
      tickets
        .filter((ticket) => ticket.match === selectedMatch)
        .sort((a, b) => {
          const section = a.section.localeCompare(b.section, undefined, {
            numeric: true,
          });
          if (section !== 0) return section;
          const row = a.row.localeCompare(b.row, undefined, { numeric: true });
          if (row !== 0) return row;
          return a.seat.localeCompare(b.seat, undefined, { numeric: true });
        }),
    [tickets, selectedMatch],
  );

  const selectedInfo = selectedTickets[0];
  const assignedCount = selectedTickets.filter((ticket) => ticket.assignedTo).length;
  const paidCount = selectedTickets.filter(
    (ticket) => ticket.assignedTo && ticket.paymentStatus.toLowerCase() === "paid",
  ).length;
  const matchValue = selectedTickets.reduce((total, ticket) => total + ticket.price, 0);

  const seatGroups = useMemo(() => {
    const grouped = new Map<string, SeatTicket[]>();
    selectedTickets.forEach((ticket) => {
      const key = `${ticket.section}::${ticket.row}`;
      grouped.set(key, [...(grouped.get(key) ?? []), ticket]);
    });
    return Array.from(grouped.entries()).map(([key, seats]) => ({
      key,
      section: seats[0].section,
      row: seats[0].row,
      seats,
    }));
  }, [selectedTickets]);

  return (
    <main className="min-h-screen bg-[#07120f] text-white">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-28 -top-24 h-80 w-80 rounded-full bg-[#70d44b]/10 blur-3xl" />
        <div className="absolute right-[-120px] top-[22rem] h-96 w-96 rounded-full bg-[#24b9a6]/10 blur-3xl" />
      </div>

      <div className="relative mx-auto w-full max-w-6xl px-4 pb-16 pt-6 sm:px-6 lg:px-8">
        <header className="rounded-[28px] border border-white/10 bg-[#0d1b17]/90 p-5 shadow-2xl shadow-black/20 backdrop-blur sm:p-7">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <div className="mb-4 flex items-center gap-3">
                <div className="grid h-11 w-11 place-items-center rounded-2xl bg-[#b8f34a] text-[#0a1712] shadow-lg shadow-[#b8f34a]/10">
                  <TicketIcon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.24em] text-[#b8f34a]">
                    Family & Friends
                  </p>
                  <p className="text-sm text-white/55">Rugby World Cup 2027</p>
                </div>
              </div>
              <h1 className="max-w-3xl text-3xl font-black tracking-[-0.04em] sm:text-5xl">
                Our RWC 2027 tickets, all in one place.
              </h1>
              <p className="mt-4 max-w-2xl text-[15px] leading-7 text-white/62 sm:text-base">
                Choose a match to see the seats, prices, who they are assigned to and payment status. This page is read-only — message Sam or Tayla if you want a seat or need to arrange payment.
              </p>
            </div>

            <div className="flex shrink-0 items-center gap-2 self-start rounded-full border border-white/10 bg-white/[0.04] px-3.5 py-2 text-xs font-bold text-white/64">
              <span
                className={`h-2 w-2 rounded-full ${
                  source === "live" ? "bg-emerald-400" : "bg-amber-300"
                }`}
              />
              {source === "live" ? "Live from Google Sheet" : "Current ticket snapshot"}
              {refreshing && <RefreshCw className="h-3.5 w-3.5 animate-spin" />}
            </div>
          </div>
        </header>

        <section className="mt-6">
          <div className="mb-3 flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.2em] text-[#89b68e]">
                Step 1
              </p>
              <h2 className="mt-1 text-xl font-black tracking-tight sm:text-2xl">
                Pick a match
              </h2>
            </div>
            <p className="hidden text-sm text-white/40 sm:block">{tickets.length} tickets total</p>
          </div>

          <div className="-mx-4 flex snap-x gap-3 overflow-x-auto px-4 pb-2 sm:mx-0 sm:grid sm:grid-cols-2 sm:overflow-visible sm:px-0 lg:grid-cols-3">
            {matches.map((match) => {
              const active = match.match === selectedMatch;
              const matchSeats = tickets.filter((ticket) => ticket.match === match.match);
              const matchAssigned = matchSeats.filter((ticket) => ticket.assignedTo).length;
              return (
                <button
                  key={match.match}
                  onClick={() => setSelectedMatch(match.match)}
                  className={`min-w-[82vw] snap-start rounded-[22px] border p-4 text-left transition sm:min-w-0 ${
                    active
                      ? "border-[#b8f34a]/55 bg-[#b8f34a]/10 shadow-lg shadow-[#b8f34a]/5"
                      : "border-white/10 bg-[#0d1b17] hover:border-white/20 hover:bg-white/[0.05]"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className={`text-xs font-black uppercase tracking-[0.16em] ${active ? "text-[#b8f34a]" : "text-white/40"}`}>
                        {formatDate(match.date)}
                      </p>
                      <h3 className="mt-2 text-lg font-black leading-tight">{match.match}</h3>
                    </div>
                    <span className={`rounded-full px-2.5 py-1 text-[11px] font-black ${active ? "bg-[#b8f34a] text-[#0a1712]" : "bg-white/8 text-white/55"}`}>
                      {matchSeats.length} seats
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-white/48">
                    {matchupDetails[match.match] ?? "Rugby World Cup 2027"}
                  </p>
                  <div className="mt-4 flex items-center gap-4 text-xs font-semibold text-white/55">
                    <span className="flex items-center gap-1.5">
                      <Clock3 className="h-3.5 w-3.5" /> {match.time}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Users className="h-3.5 w-3.5" /> {matchAssigned} assigned
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        {selectedInfo && (
          <section className="mt-7 overflow-hidden rounded-[28px] border border-white/10 bg-[#0d1b17] shadow-2xl shadow-black/15">
            <div className="border-b border-white/8 bg-gradient-to-r from-[#173225] to-[#0d1b17] p-5 sm:p-7">
              <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.2em] text-[#b8f34a]">
                    Selected match
                  </p>
                  <h2 className="mt-2 text-2xl font-black tracking-[-0.03em] sm:text-4xl">
                    {selectedInfo.match}
                  </h2>
                  <p className="mt-2 text-sm font-semibold text-white/50">
                    {matchupDetails[selectedInfo.match] ?? "Rugby World Cup 2027"}
                  </p>
                  <div className="mt-5 flex flex-col gap-2 text-sm text-white/66 sm:flex-row sm:flex-wrap sm:gap-x-6">
                    <span className="flex items-center gap-2">
                      <CalendarDays className="h-4 w-4 text-[#b8f34a]" />
                      {formatDate(selectedInfo.date)} at {selectedInfo.time}
                    </span>
                    <span className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-[#b8f34a]" />
                      {selectedInfo.venue}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:min-w-[520px]">
                  {[
                    ["Seats", selectedTickets.length],
                    ["Available", selectedTickets.length - assignedCount],
                    ["Assigned", assignedCount],
                    ["Paid", paidCount],
                  ].map(([label, value]) => (
                    <div key={label} className="rounded-2xl border border-white/8 bg-black/15 px-4 py-3">
                      <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-white/38">{label}</p>
                      <p className="mt-1 text-2xl font-black">{value}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-4 sm:p-7">
              <div className="mb-6 flex flex-col gap-3 rounded-2xl border border-white/8 bg-white/[0.025] p-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-start gap-3">
                  <Info className="mt-0.5 h-5 w-5 shrink-0 text-[#b8f34a]" />
                  <div>
                    <p className="font-bold">How reservations work</p>
                    <p className="mt-1 text-sm leading-6 text-white/52">
                      Available seats are not reserved by tapping this page. Message Sam or Tayla with the match and seat(s) you want; the Google Sheet will be updated once confirmed.
                    </p>
                  </div>
                </div>
                <div className="shrink-0 rounded-xl bg-[#b8f34a]/10 px-4 py-3 text-right">
                  <p className="text-[10px] font-black uppercase tracking-[0.14em] text-[#b8f34a]/65">Total ticket value</p>
                  <p className="mt-1 text-xl font-black text-[#b8f34a]">{formatCurrency(matchValue)}</p>
                </div>
              </div>

              <div className="space-y-7">
                {seatGroups.map((group) => (
                  <div key={group.key}>
                    <div className="mb-3 flex items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-black">Section {group.section} · Row {group.row}</p>
                        <p className="mt-0.5 text-xs text-white/38">{group.seats.length} seat{group.seats.length === 1 ? "" : "s"}</p>
                      </div>
                      <span className="rounded-full border border-white/8 bg-white/[0.04] px-3 py-1.5 text-xs font-bold text-white/48">
                        {formatCurrency(group.seats[0].price)} each
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                      {group.seats.map((ticket) => {
                        const assigned = Boolean(ticket.assignedTo);
                        const paid = ticket.paymentStatus.toLowerCase() === "paid";
                        return (
                          <div
                            key={`${ticket.section}-${ticket.row}-${ticket.seat}`}
                            className={`rounded-[18px] border p-3.5 transition ${
                              assigned
                                ? paid
                                  ? "border-emerald-400/22 bg-emerald-400/[0.055]"
                                  : "border-amber-300/20 bg-amber-300/[0.05]"
                                : "border-[#b8f34a]/18 bg-[#b8f34a]/[0.045]"
                            }`}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <p className="text-[10px] font-black uppercase tracking-[0.16em] text-white/34">Seat</p>
                                <p className="mt-0.5 text-2xl font-black tracking-tight">{ticket.seat}</p>
                              </div>
                              <span className="text-sm font-black text-white/76">{formatCurrency(ticket.price)}</span>
                            </div>

                            <div className="mt-4 border-t border-white/7 pt-3">
                              {assigned ? (
                                <>
                                  <p className="truncate text-sm font-bold text-white/88">{ticket.assignedTo}</p>
                                  <span className={`mt-2 inline-flex rounded-full border px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.11em] ${paymentClasses(ticket.paymentStatus)}`}>
                                    {ticket.paymentStatus}
                                  </span>
                                </>
                              ) : (
                                <>
                                  <p className="text-sm font-black text-[#b8f34a]">Available</p>
                                  <p className="mt-1 text-[11px] text-white/34">Not assigned</p>
                                </>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        <section className="mt-7 grid gap-3 sm:grid-cols-3">
          <div className="rounded-[22px] border border-white/8 bg-white/[0.025] p-4">
            <div className="flex items-center gap-2 text-[#b8f34a]">
              <TicketIcon className="h-4 w-4" />
              <p className="text-xs font-black uppercase tracking-[0.14em]">Available</p>
            </div>
            <p className="mt-2 text-sm leading-6 text-white/48">Seat is free to be assigned. Message us before making plans around it.</p>
          </div>
          <div className="rounded-[22px] border border-white/8 bg-white/[0.025] p-4">
            <div className="flex items-center gap-2 text-amber-200">
              <CircleDollarSign className="h-4 w-4" />
              <p className="text-xs font-black uppercase tracking-[0.14em]">Assigned / unpaid</p>
            </div>
            <p className="mt-2 text-sm leading-6 text-white/48">Seat has been allocated, but payment is still due or only partially received.</p>
          </div>
          <div className="rounded-[22px] border border-white/8 bg-white/[0.025] p-4">
            <div className="flex items-center gap-2 text-emerald-300">
              <CheckCircle2 className="h-4 w-4" />
              <p className="text-xs font-black uppercase tracking-[0.14em]">Paid</p>
            </div>
            <p className="mt-2 text-sm leading-6 text-white/48">Seat is assigned and payment is recorded as complete in the master tracker.</p>
          </div>
        </section>

        <footer className="mt-8 border-t border-white/8 pt-6 text-center text-xs leading-6 text-white/32">
          Read-only family & friends ticket view · Master records are maintained in the Rugby World Cup 2027 Google Sheet.
        </footer>
      </div>
    </main>
  );
}
