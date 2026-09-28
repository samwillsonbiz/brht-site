"use client";

import { useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  Clock3,
  MapPin,
  RefreshCw,
  Ticket as TicketIcon,
  Trophy,
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

const LIVE_SHEET_CSV_URL = "/api/rwc2027";

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
    row: "11",
    seats: [34, 35, 36],
    price: 95,
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
    match: "Round of 16 (4)",
    date: "2027-10-23",
    time: "6:45 PM",
    venue: "Perth Stadium",
    section: "509",
    row: "13",
    seats: [37, 38],
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
  "Round of 16 (4)": "Round of 16",
  "Round of 16 (8)": "Round of 16",
  "Quarter-final 1": "Quarter-final · teams TBD",
  Final: "Rugby World Cup Final · teams TBD",
};

const knockoutPairing: Record<string, string> = {
  "Round of 16 (4)": "1st Pool B vs 3rd Pool D / E / F",
  "Round of 16 (8)": "1st Pool F vs 2nd Pool B",
  "Quarter-final 1": "Teams to be confirmed",
  Final: "Teams to be confirmed",
};

const flagByTeam: Record<string, string> = {
  Australia: "🇦🇺",
  "Hong Kong China": "🇭🇰",
  "South Africa": "🇿🇦",
  Romania: "🇷🇴",
};

const appleFont =
  '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "Helvetica Neue", Arial, sans-serif';

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
    return [
      {
        match,
        date: values[column("Date")]?.trim() ?? "",
        time: values[column("Time")]?.trim() ?? "",
        venue: values[column("Venue")]?.trim() ?? "",
        section: values[column("Section")]?.trim() ?? "",
        row: values[column("Row")]?.trim() ?? "",
        seat: values[column("Seat")]?.trim() ?? "",
        price: Number(rawPrice.replace(/[^0-9.-]/g, "")) || 0,
        assignedTo: values[column("Assigned To")]?.trim() ?? "",
        paymentStatus: values[column("Payment Status")]?.trim() || "Unpaid",
      },
    ];
  });
}

function paymentClasses(status: string) {
  const normalized = status.toLowerCase();
  if (normalized === "paid") return "border-[#cfe9d6] bg-[#ecf8ef] text-[#23753a]";
  if (normalized === "partial") return "border-[#f0ddb3] bg-[#fff8e8] text-[#8a6400]";
  return "border-[#e5e5ea] bg-[#f2f2f7] text-[#6e6e73]";
}

function splitTeams(match: string): [string, string] | null {
  const separator = match.includes(" v ") ? " v " : match.includes(" vs ") ? " vs " : null;
  if (!separator) return null;
  const teams = match.split(separator).map((team) => team.trim());
  return teams.length === 2 ? [teams[0], teams[1]] : null;
}

function TeamRow({ team }: { team: string }) {
  return (
    <div className="flex items-center gap-3.5">
      <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full border border-black/[0.06] bg-[#f5f5f7] text-[28px] shadow-[0_1px_2px_rgba(0,0,0,0.04)] sm:h-13 sm:w-13 sm:text-[30px]">
        {flagByTeam[team] ?? "🏉"}
      </span>
      <span className="text-[21px] font-semibold leading-tight tracking-[-0.03em] text-[#1d1d1f] sm:text-[23px]">
        {team}
      </span>
    </div>
  );
}

export default function Rwc2027Page() {
  const [tickets, setTickets] = useState<SeatTicket[]>(fallbackTickets);
  const [selectedMatch, setSelectedMatch] = useState("South Africa v Romania");
  const [source, setSource] = useState<"snapshot" | "live">("snapshot");
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        setRefreshing(true);
        const response = await fetch(`${LIVE_SHEET_CSV_URL}?_=${Date.now()}`, { cache: "no-store" });
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
          const section = a.section.localeCompare(b.section, undefined, { numeric: true });
          if (section !== 0) return section;
          const row = a.row.localeCompare(b.row, undefined, { numeric: true });
          if (row !== 0) return row;
          return a.seat.localeCompare(b.seat, undefined, { numeric: true });
        }),
    [tickets, selectedMatch],
  );

  const selectedInfo = selectedTickets[0];
  const assignedCount = selectedTickets.filter((ticket) => ticket.assignedTo).length;
  const availableCount = selectedTickets.length - assignedCount;
  const paidCount = selectedTickets.filter(
    (ticket) => ticket.assignedTo && ticket.paymentStatus.toLowerCase() === "paid",
  ).length;

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
    <main
      className="min-h-screen bg-[#f5f5f7] pb-12 text-[#1d1d1f] antialiased"
      style={{ fontFamily: appleFont }}
    >
      <div className="sticky top-0 z-50 border-b border-black/[0.06] bg-white/80 backdrop-blur-2xl supports-[backdrop-filter]:bg-white/72">
        <div className="mx-auto flex h-[62px] w-full max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="grid h-9 w-9 place-items-center rounded-[12px] bg-[#0b6b45] text-white shadow-[0_1px_2px_rgba(0,0,0,0.08)]">
              <TicketIcon className="h-[18px] w-[18px]" strokeWidth={1.8} />
            </div>
            <div>
              <p className="text-[15px] font-semibold leading-4 tracking-[-0.01em]">RWC 2027 Tickets</p>
              <p className="mt-0.5 text-[11px] font-medium text-[#86868b]">Family & Friends</p>
            </div>
          </div>
          <div className="flex items-center gap-2 rounded-full bg-[#f2f2f7] px-3 py-1.5 text-[11px] font-semibold text-[#6e6e73]">
            <span className={`h-2 w-2 rounded-full ${source === "live" ? "bg-[#34c759]" : "bg-[#ff9f0a]"}`} />
            <span>{source === "live" ? "Live" : "Snapshot"}</span>
            {refreshing && <RefreshCw className="h-3 w-3 animate-spin" strokeWidth={1.8} />}
          </div>
        </div>
      </div>

      <div className="mx-auto w-full max-w-6xl px-4 pt-9 sm:px-6 sm:pt-12 lg:px-8">
        <section className="max-w-3xl">
          <p className="text-[13px] font-semibold text-[#0b6b45]">Rugby World Cup 2027</p>
          <h1 className="mt-2 text-[34px] font-semibold leading-[1.03] tracking-[-0.045em] text-[#1d1d1f] sm:text-[48px]">
            Choose a match.
          </h1>
          <p className="mt-3 max-w-2xl text-[16px] leading-6 tracking-[-0.01em] text-[#6e6e73] sm:text-[17px] sm:leading-7">
            See the exact seats, price, who they’re assigned to, and whether they’ve been paid. To reserve a seat, message Sam or Tayla.
          </p>
        </section>

        <section className="mt-7 sm:mt-9">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-[20px] font-semibold tracking-[-0.025em] text-[#1d1d1f]">Matches</h2>
            <span className="text-[13px] font-medium text-[#86868b]">{matches.length} games</span>
          </div>

          <div className="flex snap-x gap-3 overflow-x-auto pb-3 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:grid sm:grid-cols-2 sm:overflow-visible lg:grid-cols-3">
            {matches.map((match) => {
              const active = match.match === selectedMatch;
              const matchTickets = tickets.filter((ticket) => ticket.match === match.match);
              const available = matchTickets.filter((ticket) => !ticket.assignedTo).length;
              const prices = matchTickets.map((ticket) => ticket.price);
              const minPrice = Math.min(...prices);
              const maxPrice = Math.max(...prices);
              const teams = splitTeams(match.match);

              return (
                <button
                  key={match.match}
                  type="button"
                  aria-pressed={active}
                  onClick={() => setSelectedMatch(match.match)}
                  className={`group min-w-[86vw] snap-start rounded-[22px] border bg-white p-5 text-left shadow-[0_1px_2px_rgba(0,0,0,0.03),0_8px_28px_rgba(0,0,0,0.035)] transition-[transform,box-shadow,border-color] duration-200 ease-out active:scale-[0.985] sm:min-w-0 ${
                    active
                      ? "border-[#0b6b45] ring-1 ring-[#0b6b45]/10"
                      : "border-black/[0.07] hover:-translate-y-0.5 hover:shadow-[0_2px_3px_rgba(0,0,0,0.04),0_14px_34px_rgba(0,0,0,0.06)]"
                  }`}
                >
                  <div className="mb-4 flex items-start justify-between gap-3">
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#86868b]">
                        {matchupDetails[match.match] ?? "Rugby World Cup 2027"}
                      </p>
                      <p className="mt-1.5 text-[13px] font-medium tracking-[-0.01em] text-[#6e6e73]">
                        {formatDate(match.date)} · {match.time}
                      </p>
                    </div>
                    <div className={`grid h-8 w-8 shrink-0 place-items-center rounded-full transition-colors ${active ? "bg-[#0b6b45] text-white" : "bg-[#f2f2f7] text-[#86868b]"}`}>
                      {active ? (
                        <CheckCircle2 className="h-4 w-4" strokeWidth={1.9} />
                      ) : (
                        <ChevronRight className="h-4 w-4" strokeWidth={1.8} />
                      )}
                    </div>
                  </div>

                  {teams ? (
                    <div className="space-y-3 py-1">
                      <TeamRow team={teams[0]} />
                      <TeamRow team={teams[1]} />
                    </div>
                  ) : (
                    <div className="flex min-h-[122px] items-center gap-4 py-2">
                      <span className="grid h-13 w-13 shrink-0 place-items-center rounded-full bg-[#f2f2f7] text-[#0b6b45]">
                        <Trophy className="h-5 w-5" strokeWidth={1.7} />
                      </span>
                      <div>
                        <p className="text-[22px] font-semibold leading-tight tracking-[-0.035em] text-[#1d1d1f]">{match.match}</p>
                        <p className="mt-1.5 text-[13px] font-medium leading-5 text-[#6e6e73]">
                          {knockoutPairing[match.match] ?? "Teams to be confirmed"}
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="mt-5 flex items-end justify-between border-t border-black/[0.06] pt-4">
                    <div className="min-w-0 pr-3">
                      <p className="truncate text-[13px] font-medium text-[#3a3a3c]">{match.venue}</p>
                      <p className="mt-0.5 text-[12px] text-[#86868b]">{available} of {matchTickets.length} available</p>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-[#86868b]">{minPrice === maxPrice ? "Per seat" : "From"}</p>
                      <p className="mt-0.5 text-[17px] font-semibold tracking-[-0.02em] text-[#0b6b45]">{formatCurrency(minPrice)}</p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        {selectedInfo && (
          <section className="mt-7 sm:mt-9">
            <div className="rounded-[24px] border border-black/[0.07] bg-white shadow-[0_1px_2px_rgba(0,0,0,0.03),0_10px_32px_rgba(0,0,0,0.035)]">
              <div className="border-b border-black/[0.06] p-5 sm:p-7">
                <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
                  <div>
                    <p className="text-[12px] font-semibold text-[#0b6b45]">Selected match</p>
                    <h2 className="mt-1 text-[28px] font-semibold leading-tight tracking-[-0.04em] text-[#1d1d1f] sm:text-[34px]">{selectedMatch}</h2>
                    {knockoutPairing[selectedMatch] && knockoutPairing[selectedMatch] !== "Teams to be confirmed" && (
                      <p className="mt-1 text-[14px] font-medium text-[#6e6e73]">{knockoutPairing[selectedMatch]}</p>
                    )}
                    <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2.5 text-[13px] font-medium text-[#6e6e73]">
                      <span className="flex items-center gap-1.5"><CalendarDays className="h-4 w-4 text-[#86868b]" strokeWidth={1.7} />{formatDate(selectedInfo.date)}</span>
                      <span className="flex items-center gap-1.5"><Clock3 className="h-4 w-4 text-[#86868b]" strokeWidth={1.7} />{selectedInfo.time}</span>
                      <span className="flex items-center gap-1.5"><MapPin className="h-4 w-4 text-[#86868b]" strokeWidth={1.7} />{selectedInfo.venue}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 overflow-hidden rounded-[16px] bg-[#f5f5f7] lg:min-w-[360px]">
                    <div className="p-3.5 text-center"><p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-[#86868b]">Available</p><p className="mt-1 text-[20px] font-semibold tracking-[-0.02em] text-[#1d1d1f]">{availableCount}</p></div>
                    <div className="border-x border-black/[0.06] p-3.5 text-center"><p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-[#86868b]">Assigned</p><p className="mt-1 text-[20px] font-semibold tracking-[-0.02em] text-[#1d1d1f]">{assignedCount}</p></div>
                    <div className="p-3.5 text-center"><p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-[#86868b]">Paid</p><p className="mt-1 text-[20px] font-semibold tracking-[-0.02em] text-[#1d1d1f]">{paidCount}</p></div>
                  </div>
                </div>
              </div>

              <div className="p-4 sm:p-7">
                <div className="mb-5">
                  <h3 className="text-[20px] font-semibold tracking-[-0.025em] text-[#1d1d1f]">Seats</h3>
                </div>

                <div className="space-y-5">
                  {seatGroups.map((group) => (
                    <div key={group.key} className="overflow-hidden rounded-[18px] bg-[#f5f5f7]">
                      <div className="flex items-center justify-between px-4 py-3.5 sm:px-5">
                        <div>
                          <p className="text-[11px] font-medium text-[#86868b]">Section {group.section}</p>
                          <p className="mt-0.5 text-[16px] font-semibold tracking-[-0.015em] text-[#1d1d1f]">Row {group.row}</p>
                        </div>
                        <span className="rounded-full bg-white px-2.5 py-1 text-[11px] font-medium text-[#6e6e73] shadow-[0_1px_1px_rgba(0,0,0,0.03)]">{group.seats.length} seats</span>
                      </div>

                      <div className="border-t border-black/[0.06] bg-white">
                        {group.seats.map((ticket, index) => {
                          const assigned = Boolean(ticket.assignedTo);
                          return (
                            <div
                              key={`${ticket.section}-${ticket.row}-${ticket.seat}`}
                              className={`flex min-h-[78px] items-center justify-between gap-4 px-4 py-3.5 sm:px-5 ${index !== group.seats.length - 1 ? "border-b border-black/[0.055]" : ""}`}
                            >
                              <div className="flex min-w-0 items-center gap-3.5">
                                <div className={`grid h-10 w-10 shrink-0 place-items-center rounded-[12px] text-[15px] font-semibold ${assigned ? "bg-[#f2f2f7] text-[#3a3a3c]" : "bg-[#ecf8ef] text-[#23753a]"}`}>{ticket.seat}</div>
                                <div className="min-w-0">
                                  <p className="text-[15px] font-semibold tracking-[-0.01em] text-[#1d1d1f]">Seat {ticket.seat}</p>
                                  {assigned ? (
                                    <div className="mt-0.5 flex min-w-0 items-center gap-1.5 text-[12px] text-[#6e6e73]"><Users className="h-3.5 w-3.5 shrink-0" strokeWidth={1.7} /><span className="truncate">{ticket.assignedTo}</span></div>
                                  ) : (
                                    <div className="mt-0.5 flex items-center gap-1.5 text-[12px] font-medium text-[#23753a]"><CheckCircle2 className="h-3.5 w-3.5" strokeWidth={1.8} />Available</div>
                                  )}
                                </div>
                              </div>

                              <div className="flex shrink-0 items-center gap-3 text-right">
                                {assigned && <span className={`hidden rounded-full border px-2.5 py-1 text-[10px] font-semibold sm:inline-flex ${paymentClasses(ticket.paymentStatus)}`}>{ticket.paymentStatus}</span>}
                                <div>
                                  <p className="text-[15px] font-semibold tracking-[-0.015em] text-[#1d1d1f]">{formatCurrency(ticket.price)}</p>
                                  {assigned && <span className={`mt-1 inline-flex rounded-full border px-2 py-0.5 text-[9px] font-semibold sm:hidden ${paymentClasses(ticket.paymentStatus)}`}>{ticket.paymentStatus}</span>}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>
        )}
      </div>
    </main>
  );
}