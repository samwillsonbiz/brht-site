"use client";

import { useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  CircleDollarSign,
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
  "Round of 16 (4)": "Knockout match · teams TBD",
  "Round of 16 (8)": "Knockout match · teams TBD",
  "Quarter-final 1": "Quarter-final · teams TBD",
  Final: "Rugby World Cup Final · teams TBD",
};

const flagByTeam: Record<string, string> = {
  Australia: "🇦🇺",
  "Hong Kong China": "🇭🇰",
  "South Africa": "🇿🇦",
  Romania: "🇷🇴",
  Wales: "🏴",
  Zimbabwe: "🇿🇼",
  England: "🏴",
  Scotland: "🏴",
  Ireland: "🇮🇪",
  France: "🇫🇷",
  Italy: "🇮🇹",
  Georgia: "🇬🇪",
  Japan: "🇯🇵",
  "New Zealand": "🇳🇿",
  Argentina: "🇦🇷",
  Fiji: "🇫🇯",
  Tonga: "🇹🇴",
  Samoa: "🇼🇸",
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
    return "border-emerald-200 bg-emerald-50 text-emerald-700";
  }
  if (normalized === "partial") {
    return "border-amber-200 bg-amber-50 text-amber-700";
  }
  return "border-rose-200 bg-rose-50 text-rose-700";
}

function splitTeams(match: string): [string, string] | null {
  const separator = match.includes(" v ") ? " v " : match.includes(" vs ") ? " vs " : null;
  if (!separator) return null;
  const teams = match.split(separator).map((team) => team.trim());
  if (teams.length !== 2) return null;
  return [teams[0], teams[1]];
}

function TeamRow({ team }: { team: string }) {
  const flag = flagByTeam[team] ?? "🏉";
  return (
    <div className="flex items-center gap-3.5">
      <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full border border-[#dfe5df] bg-[#f7f9f6] text-[28px] shadow-sm sm:h-14 sm:w-14 sm:text-[31px]">
        {flag}
      </span>
      <span className="text-[22px] font-black leading-tight tracking-[-0.035em] text-[#111814] sm:text-[25px]">
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
  const availableCount = selectedTickets.length - assignedCount;
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
    <main className="min-h-screen bg-[#f4f6f2] text-[#152019]">
      <div className="mx-auto w-full max-w-6xl px-4 pb-16 pt-5 sm:px-6 sm:pt-7 lg:px-8">
        <header className="overflow-hidden rounded-[28px] border border-[#dde4dc] bg-white p-5 shadow-[0_12px_40px_rgba(22,48,31,0.07)] sm:p-8">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
            <div className="max-w-3xl">
              <div className="mb-4 flex items-center gap-3">
                <div className="grid h-11 w-11 place-items-center rounded-2xl bg-[#0f6b42] text-white shadow-sm">
                  <TicketIcon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.22em] text-[#0f6b42]">
                    Family & Friends
                  </p>
                  <p className="text-sm font-semibold text-[#6e7c73]">Rugby World Cup 2027</p>
                </div>
              </div>
              <h1 className="text-3xl font-black tracking-[-0.045em] text-[#101713] sm:text-5xl">
                Pick a match. See every seat.
              </h1>
              <p className="mt-4 max-w-2xl text-[15px] leading-7 text-[#657168] sm:text-base">
                This is our shared read-only ticket view. Choose a game to see the exact seats, price, assignment and payment status. Message Sam or Tayla if you want a seat.
              </p>
            </div>

            <div className="flex shrink-0 items-center gap-2 self-start rounded-full border border-[#dfe5df] bg-[#f7f9f6] px-3.5 py-2 text-xs font-bold text-[#59665d]">
              <span
                className={`h-2 w-2 rounded-full ${
                  source === "live" ? "bg-emerald-500" : "bg-amber-400"
                }`}
              />
              {source === "live" ? "Live from Google Sheet" : "Current ticket snapshot"}
              {refreshing && <RefreshCw className="h-3.5 w-3.5 animate-spin" />}
            </div>
          </div>
        </header>

        <section className="mt-8">
          <div className="mb-4 flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.2em] text-[#0f6b42]">
                Choose a match
              </p>
              <h2 className="mt-1 text-2xl font-black tracking-[-0.035em] text-[#111814] sm:text-3xl">
                Which game are you looking at?
              </h2>
            </div>
            <span className="hidden text-sm font-semibold text-[#758178] sm:block">
              {matches.length} games
            </span>
          </div>

          <div className="flex snap-x gap-4 overflow-x-auto pb-3 sm:grid sm:grid-cols-2 sm:overflow-visible lg:grid-cols-3">
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
                  className={`group min-w-[84vw] snap-start rounded-[24px] border bg-white p-5 text-left shadow-[0_8px_24px_rgba(27,51,35,0.06)] transition duration-200 sm:min-w-0 ${
                    active
                      ? "border-[#0f6b42] ring-2 ring-[#0f6b42]/10"
                      : "border-[#dce4dc] hover:-translate-y-0.5 hover:border-[#b9c9bc] hover:shadow-[0_12px_30px_rgba(27,51,35,0.10)]"
                  }`}
                >
                  <div className="mb-4 flex items-start justify-between gap-3">
                    <div>
                      <p className="text-[11px] font-black uppercase tracking-[0.16em] text-[#7a877e]">
                        {matchupDetails[match.match] ?? "Rugby World Cup 2027"}
                      </p>
                      <p className="mt-1.5 text-sm font-bold text-[#344238]">
                        {formatDate(match.date)} · {match.time}
                      </p>
                    </div>
                    <div
                      className={`grid h-9 w-9 shrink-0 place-items-center rounded-full transition ${
                        active
                          ? "bg-[#0f6b42] text-white"
                          : "bg-[#f2f5f1] text-[#657269] group-hover:bg-[#eaf0e9]"
                      }`}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </div>
                  </div>

                  {teams ? (
                    <div className="space-y-3.5 py-1">
                      <TeamRow team={teams[0]} />
                      <TeamRow team={teams[1]} />
                    </div>
                  ) : (
                    <div className="flex min-h-[126px] items-center gap-4 py-2">
                      <span className="grid h-14 w-14 shrink-0 place-items-center rounded-full border border-[#dfe5df] bg-[#f6f8f5] text-[#0f6b42] shadow-sm">
                        <Trophy className="h-6 w-6" />
                      </span>
                      <div>
                        <p className="text-[25px] font-black leading-tight tracking-[-0.04em] text-[#111814]">
                          {match.match}
                        </p>
                        <p className="mt-1 text-sm font-semibold text-[#77837a]">Teams to be confirmed</p>
                      </div>
                    </div>
                  )}

                  <div className="mt-5 flex items-center justify-between border-t border-[#edf1ec] pt-4 text-sm">
                    <div>
                      <p className="font-bold text-[#344238]">{match.venue}</p>
                      <p className="mt-0.5 text-xs font-semibold text-[#7b877f]">
                        {available} of {matchTickets.length} seats available
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-[11px] font-black uppercase tracking-[0.12em] text-[#8b958e]">
                        {minPrice === maxPrice ? "Per seat" : "From"}
                      </p>
                      <p className="mt-0.5 text-lg font-black text-[#0f6b42]">
                        {formatCurrency(minPrice)}
                      </p>
                    </div>
                  </div>

                  {active && (
                    <div className="mt-4 rounded-xl bg-[#eaf5ee] px-3 py-2 text-center text-xs font-black uppercase tracking-[0.14em] text-[#0f6b42]">
                      Selected
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </section>

        {selectedInfo && (
          <section className="mt-7 overflow-hidden rounded-[28px] border border-[#dde4dc] bg-white shadow-[0_12px_40px_rgba(22,48,31,0.07)]">
            <div className="border-b border-[#e8ede7] bg-[#fbfcfa] p-5 sm:p-7">
              <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.2em] text-[#0f6b42]">
                    Selected match
                  </p>
                  <h2 className="mt-2 text-3xl font-black tracking-[-0.045em] text-[#111814] sm:text-4xl">
                    {selectedMatch}
                  </h2>
                  <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm font-semibold text-[#657168]">
                    <span className="flex items-center gap-2">
                      <CalendarDays className="h-4 w-4 text-[#0f6b42]" />
                      {formatDate(selectedInfo.date)}
                    </span>
                    <span className="flex items-center gap-2">
                      <Clock3 className="h-4 w-4 text-[#0f6b42]" />
                      {selectedInfo.time}
                    </span>
                    <span className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-[#0f6b42]" />
                      {selectedInfo.venue}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:min-w-[500px]">
                  <div className="rounded-2xl border border-[#e1e7e0] bg-white p-3.5">
                    <p className="text-[10px] font-black uppercase tracking-[0.14em] text-[#89938c]">Seats</p>
                    <p className="mt-1 text-xl font-black text-[#19231d]">{selectedTickets.length}</p>
                  </div>
                  <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-3.5">
                    <p className="text-[10px] font-black uppercase tracking-[0.14em] text-emerald-700">Available</p>
                    <p className="mt-1 text-xl font-black text-emerald-800">{availableCount}</p>
                  </div>
                  <div className="rounded-2xl border border-[#e1e7e0] bg-white p-3.5">
                    <p className="text-[10px] font-black uppercase tracking-[0.14em] text-[#89938c]">Assigned</p>
                    <p className="mt-1 text-xl font-black text-[#19231d]">{assignedCount}</p>
                  </div>
                  <div className="rounded-2xl border border-[#e1e7e0] bg-white p-3.5">
                    <p className="text-[10px] font-black uppercase tracking-[0.14em] text-[#89938c]">Paid</p>
                    <p className="mt-1 text-xl font-black text-[#19231d]">{paidCount}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-5 sm:p-7">
              <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <h3 className="text-xl font-black tracking-[-0.03em] text-[#111814]">Seat availability</h3>
                  <p className="mt-1 text-sm font-medium text-[#77837a]">Tap a match above to switch games. Seats here are read-only.</p>
                </div>
                <div className="flex items-center gap-2 text-sm font-bold text-[#59665d]">
                  <CircleDollarSign className="h-4 w-4 text-[#0f6b42]" />
                  Total ticket value {formatCurrency(matchValue)}
                </div>
              </div>

              <div className="space-y-5">
                {seatGroups.map((group) => (
                  <div key={group.key} className="rounded-[22px] border border-[#e2e8e1] bg-[#fafbfa] p-4 sm:p-5">
                    <div className="mb-4 flex items-center justify-between gap-3">
                      <div>
                        <p className="text-[11px] font-black uppercase tracking-[0.16em] text-[#8a948d]">Location</p>
                        <p className="mt-1 text-lg font-black text-[#1b261f]">
                          Section {group.section} · Row {group.row}
                        </p>
                      </div>
                      <span className="rounded-full border border-[#dfe5df] bg-white px-3 py-1.5 text-xs font-bold text-[#69766d] shadow-sm">
                        {group.seats.length} seats
                      </span>
                    </div>

                    <div className="grid grid-cols-1 gap-3 min-[440px]:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                      {group.seats.map((ticket) => {
                        const assigned = Boolean(ticket.assignedTo);
                        return (
                          <div
                            key={`${ticket.section}-${ticket.row}-${ticket.seat}`}
                            className={`rounded-[18px] border p-4 shadow-sm ${
                              assigned
                                ? "border-[#dfe5df] bg-white"
                                : "border-emerald-200 bg-emerald-50/60"
                            }`}
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div>
                                <p className="text-[10px] font-black uppercase tracking-[0.15em] text-[#8a948d]">Seat</p>
                                <p className="mt-0.5 text-2xl font-black tracking-[-0.04em] text-[#111814]">{ticket.seat}</p>
                              </div>
                              <p className="text-base font-black text-[#0f6b42]">{formatCurrency(ticket.price)}</p>
                            </div>

                            <div className="mt-4 border-t border-[#e7ece6] pt-3">
                              {assigned ? (
                                <>
                                  <div className="flex items-center gap-2 text-sm font-bold text-[#2f3c33]">
                                    <Users className="h-4 w-4 text-[#69766d]" />
                                    <span className="truncate">{ticket.assignedTo}</span>
                                  </div>
                                  <span className={`mt-2 inline-flex rounded-full border px-2.5 py-1 text-[11px] font-black uppercase tracking-[0.08em] ${paymentClasses(ticket.paymentStatus)}`}>
                                    {ticket.paymentStatus}
                                  </span>
                                </>
                              ) : (
                                <div className="flex items-center gap-2 text-sm font-black text-emerald-700">
                                  <CheckCircle2 className="h-4 w-4" />
                                  Available
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 rounded-[22px] border border-[#dce7dd] bg-[#f0f7f1] p-5 sm:flex sm:items-center sm:justify-between sm:gap-6">
                <div>
                  <p className="font-black text-[#17301f]">Want one of the available seats?</p>
                  <p className="mt-1 text-sm leading-6 text-[#607066]">
                    Message Sam or Tayla with the game and seat number. We’ll update the Google Sheet once it is assigned and again when payment is received.
                  </p>
                </div>
                <div className="mt-4 flex shrink-0 items-center gap-2 rounded-full bg-white px-4 py-2.5 text-xs font-black uppercase tracking-[0.12em] text-[#0f6b42] shadow-sm sm:mt-0">
                  <CheckCircle2 className="h-4 w-4" />
                  Sheet is source of truth
                </div>
              </div>
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
