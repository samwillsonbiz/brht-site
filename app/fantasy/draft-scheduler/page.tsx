"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  CalendarDays, Check, CheckCircle2, ChevronLeft, ChevronRight,
  Globe2, Loader2, RefreshCw, Save, Users, X,
} from "lucide-react";

type Team = { id: number; name: string; short: string };
type Answer = { team_id: number; blocked_slots: string[]; available_slots: string[]; submitted_at: string; updated_at: string };
type SavedSelection = Pick<Answer, "blocked_slots" | "available_slots">;
type SlotInfo = { available: Team[]; unavailable: Team[]; pending: Team[]; confirmed: boolean };

const TEAMS: Team[] = [
  { id: 1, name: "Gavin", short: "GA" },
  { id: 4, name: "Zach", short: "ZA" },
  { id: 5, name: "Connor", short: "CO" },
  { id: 6, name: "Alex", short: "AL" },
  { id: 8, name: "Ian", short: "IA" },
  { id: 9, name: "Will", short: "WI" },
  { id: 10, name: "Demarko", short: "DE" },
  { id: 11, name: "Brennan", short: "BR" },
  { id: 12, name: "Sam W", short: "SA" },
  { id: 13, name: "Scott", short: "SC" },
  { id: 14, name: "Mckenna", short: "MC" },
  { id: 15, name: "Sam M", short: "SA" },
];

const URL = "https://zqwdooykgwkfhwyayucg.supabase.co";
const KEY = "sb_publishable_wnOaPIGn-Nbv80MLv3qLFg_mH3l34ug";
const API = URL + "/rest/v1/fantasy_draft_availability";
const START_DAY = "2026-10-08";
const HOURS = Array.from({ length: 15 }, (_, i) => 8 + i);
const DAYS = Array.from({ length: 14 }, (_, i) => {
  const date = new Date(Date.UTC(2026, 9, 8 + i, 12));
  return date.toISOString().slice(0, 10);
});
const SLOTS: Record<string, string[]> = Object.fromEntries(
  DAYS.map((day, d) => [day, HOURS.map((h) => new Date(Date.UTC(2026, 9, 8 + d, h + 6)).toISOString())]),
);
const ALL_IDS = new Set(Object.values(SLOTS).flat());
const font = '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "Helvetica Neue", Arial, sans-serif';

function timeLabel(iso: string, zone: string, long = false) {
  const options: Intl.DateTimeFormatOptions = { timeZone: zone, hour: "numeric", hour12: true };
  if (long) {
    options.minute = "2-digit";
    options.weekday = "short";
    options.month = "short";
    options.day = "numeric";
  }
  return new Intl.DateTimeFormat("en-US", options).format(new Date(iso));
}
function rangeLabel(iso: string, duration: number, zone: string) {
  const end = new Date(Date.parse(iso) + duration * 3_600_000).toISOString();
  return timeLabel(iso, zone, true) + " – " + timeLabel(end, zone);
}
function dateLabel(day: string) {
  return new Intl.DateTimeFormat("en-US", { timeZone: "UTC", weekday: "short", month: "short", day: "numeric" }).format(new Date(day + "T12:00:00Z"));
}
function slotStatus(id: string, answerMap: Map<number, Answer>): SlotInfo {
  const available: Team[] = [], unavailable: Team[] = [], pending: Team[] = [];
  for (const team of TEAMS) {
    const response = answerMap.get(team.id);
    if (!response) pending.push(team);
    else if (response.blocked_slots.includes(id)) unavailable.push(team);
    else if (response.available_slots.includes(id)) available.push(team);
    else pending.push(team);
  }
  return { available, unavailable, pending, confirmed: available.length === 12 };
}
/**
 * Build local calendar positions from the SAME UTC slot IDs everyone uses.
 * A slot moves between local dates/hours when the viewer changes time zone,
 * but its database ID never changes. Minutes are included for +05:30/+05:45 etc.
 */
function calendarForZone(zone: string) {
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: zone, year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit", hourCycle: "h23",
  });
  const byDay: Record<string, string[]> = {};
  const byClock: Record<string, Record<string, string>> = {};
  const clocks = new Set<string>();
  for (const id of ALL_IDS) {
    const parts = formatter.formatToParts(new Date(id));
    const get = (type: string) => parts.find(part => part.type === type)?.value ?? "";
    const day = get("year") + "-" + get("month") + "-" + get("day");
    const clock = get("hour") + ":" + get("minute");
    if (!byDay[day]) { byDay[day] = []; byClock[day] = {}; }
    byDay[day].push(id);
    byClock[day][clock] = id;
    clocks.add(clock);
  }
  // Ordered local dates and clock labels are presentation-only; UTC save IDs stay stable.
  return { dates: Object.keys(byDay).sort(), byDay, byClock, clocks: [...clocks].sort() };
}

function localClockLabel(clock: string) {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: "UTC", hour: "numeric", minute: "2-digit", hour12: true,
  }).format(new Date("2026-01-01T" + clock + ":00Z"));
}
const FAVORITE_ZONES = [
  "America/Denver","America/Los_Angeles","America/Chicago","America/New_York",
  "Australia/Perth","Australia/Sydney","Europe/London","Europe/Paris",
  "Asia/Dubai","Asia/Singapore","Asia/Tokyo","Pacific/Auckland","UTC",
];
function zoneDisplay(zone: string) {
  const labels: Record<string, string> = {
    "America/Denver":"US Mountain (Denver)","America/Los_Angeles":"US Pacific (Los Angeles)",
    "America/Chicago":"US Central (Chicago)","America/New_York":"US Eastern (New York)",
    "Australia/Perth":"Perth · AWST (UTC+8)","Australia/Sydney":"Sydney, Australia",
    "Europe/London":"London, UK","Europe/Paris":"Paris, France",
    "Asia/Dubai":"Dubai, UAE","Asia/Singapore":"Singapore",
    "Asia/Tokyo":"Tokyo, Japan","Pacific/Auckland":"Auckland, NZ","UTC":"UTC",
  };
  return labels[zone] || zone.replaceAll("_"," ");
}

function TeamPill({ team, mode = "neutral" }: {team: Team; mode?: "neutral" | "bad" | "good"}) {
  const bg = mode === "bad" ? "bg-[#fff0f0] text-[#ad454b] border-[#f5d7d8]"
    : mode === "good" ? "bg-[#ebf7ef] text-[#2a7950] border-[#d7eade]"
    : "bg-[#f4f4f7] text-[#64646a] border-[#e9e9ee]";
  return <span className={"inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1.5 text-[12px] font-medium " + bg}><span className="font-bold">{team.short}</span><span className="hidden sm:inline">{team.name}</span></span>;
}

export default function DraftSchedulePage() {
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [teamId, setTeamId] = useState<number | null>(null);
  const [blocked, setBlocked] = useState<string[]>([]);
  const [available, setAvailable] = useState<string[]>([]);
  // Local baseline of the selected manager's last saved responses.
  // Never update shared availability just to calculate dashboard counters.
  const [savedBaseline, setSavedBaseline] = useState<SavedSelection>({ blocked_slots: [], available_slots: [] });
  const [week, setWeek] = useState(0);
  const [selected, setSelected] = useState(SLOTS[START_DAY][10]);
  const [zone, setZone] = useState("America/Denver");
  const [viewerZone, setViewerZone] = useState("Australia/Perth");
  const [zoneFilter, setZoneFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  useEffect(() => {
    try {
      const detected = Intl.DateTimeFormat().resolvedOptions().timeZone;
      if (detected) { setViewerZone(detected); setZone(detected); }
    } catch { /* default Perth */ }
  }, []);

  const reload = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const res = await fetch(API + "?select=team_id,blocked_slots,available_slots,submitted_at,updated_at&order=team_id.asc", {
        headers: { apikey: KEY }, cache: "no-store",
      });
      if (!res.ok) throw new Error("Unable to load group availability (" + res.status + ")");
      const data = await res.json() as Answer[];
      setAnswers(data);
      setLastUpdated(new Date());
      setError("");
    } catch (e) { setError(e instanceof Error ? e.message : "Unable to load availability."); }
    finally { if (!silent) setLoading(false); }
  }, []);
  useEffect(() => {
    void reload();

    // Fast shared updates while managers are coordinating. Hidden tabs pause
    // polling to avoid unnecessary database requests and refresh on return.
    const id = window.setInterval(() => {
      if (document.visibilityState === "visible") void reload(true);
    }, 5000);

    const onVisibilityChange = () => {
      if (document.visibilityState === "visible") void reload(true);
    };
    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      window.clearInterval(id);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, [reload]);

  const answerMap = useMemo(() => new Map(answers.map(a => [a.team_id, a])), [answers]);
  const blockedSet = useMemo(() => new Set(blocked), [blocked]);
  const availableSet = useMemo(() => new Set(available), [available]);
  const calendar = useMemo(() => calendarForZone(zone), [zone]);
  const savedBlockedSet = useMemo(() => new Set(savedBaseline.blocked_slots), [savedBaseline.blocked_slots]);
  const savedAvailableSet = useMemo(() => new Set(savedBaseline.available_slots), [savedBaseline.available_slots]);

  // Count changed hours, not button presses: undoing an edit reduces the count.
  const unsavedChanges = useMemo(() => {
    if (!teamId) return 0;
    let changed = 0;
    for (const id of ALL_IDS) {
      const previous = savedBlockedSet.has(id) ? "blocked" : savedAvailableSet.has(id) ? "available" : "unmarked";
      const current = blockedSet.has(id) ? "blocked" : availableSet.has(id) ? "available" : "unmarked";
      if (previous !== current) changed++;
    }
    return changed;
  }, [teamId, savedBlockedSet, savedAvailableSet, blockedSet, availableSet]);
  const undecidedHours = teamId ? ALL_IDS.size - blockedSet.size - availableSet.size : ALL_IDS.size;
  const decidedHours = ALL_IDS.size - undecidedHours;
  const dirty = unsavedChanges > 0;

  const selectTeam = (id: number | null) => {
    if (dirty && !window.confirm("Discard your unsaved availability changes?")) return;
    const existing = id ? answerMap.get(id) : undefined;
    const savedBlocked = (existing?.blocked_slots ?? []).filter(slot => ALL_IDS.has(slot));
    const savedAvailable = (existing?.available_slots ?? []).filter(slot => ALL_IDS.has(slot));
    setTeamId(id);
    setBlocked(savedBlocked);
    setAvailable(savedAvailable);
    setSavedBaseline({ blocked_slots: savedBlocked, available_slots: savedAvailable });
    setSuccess(""); setError("");
  };
  const markSlot = (id: string, status: "available" | "blocked") => {
    setSelected(id);
    if (!teamId) return;
    if (status === "blocked") {
      if (blockedSet.has(id)) setBlocked(previous => previous.filter(slot => slot !== id));
      else {
        setBlocked(previous => [...previous, id]);
        setAvailable(previous => previous.filter(slot => slot !== id));
      }
    } else {
      if (availableSet.has(id)) setAvailable(previous => previous.filter(slot => slot !== id));
      else {
        setAvailable(previous => [...previous, id]);
        setBlocked(previous => previous.filter(slot => slot !== id));
      }
    }
    setSuccess("");
  };
  const wholeDay = (day: string) => {
    if (!teamId) return;
    const list = calendar.byDay[day] ?? [], allBlocked = list.length > 0 && list.every(id => blockedSet.has(id));
    setBlocked(previous => allBlocked ? previous.filter(id => !list.includes(id)) : Array.from(new Set([...previous, ...list])));
    if (!allBlocked) setAvailable(previous => previous.filter(id => !list.includes(id)));
    setSuccess("");
  };
  const availableWholeDay = (day: string) => {
    if (!teamId) return;
    const list = calendar.byDay[day] ?? [], allAvailable = list.length > 0 && list.every(id => availableSet.has(id));
    setAvailable(previous => allAvailable ? previous.filter(id => !list.includes(id)) : Array.from(new Set([...previous, ...list])));
    if (!allAvailable) setBlocked(previous => previous.filter(id => !list.includes(id)));
    setSuccess("");
  };

  const save = async () => {
    if (!teamId || saving) return;
    setSaving(true); setError(""); setSuccess("");
    const row = {
      team_id: teamId, blocked_slots: [...new Set(blocked)].filter(s => ALL_IDS.has(s)).sort(),
      available_slots: [...new Set(available)].filter(s => ALL_IDS.has(s) && !blockedSet.has(s)).sort(),
      submitted_at: new Date().toISOString(), updated_at: new Date().toISOString(),
    };
    try {
      const res = await fetch(API + "?on_conflict=team_id", {
        method: "POST",
        headers: { apikey: KEY, "Content-Type": "application/json", Prefer: "resolution=merge-duplicates,return=representation" },
        body: JSON.stringify(row),
      });
      if (!res.ok) throw new Error("Unable to save (" + res.status + "): " + (await res.text()).slice(0,140));
      const data = await res.json() as Answer[];
      const updated = data[0] ?? row;
      setAnswers(previous => [...previous.filter(x => x.team_id !== teamId), updated]);
      setSavedBaseline({
        blocked_slots: updated.blocked_slots.filter(slot => ALL_IDS.has(slot)),
        available_slots: updated.available_slots.filter(slot => ALL_IDS.has(slot)),
      });
      setSuccess("Saved! Your team is included in the results.");
      setLastUpdated(new Date());
    } catch (e) { setError(e instanceof Error ? e.message : "Unable to save."); }
    finally { setSaving(false); }
  };

  const currentInfo = useMemo(() => slotStatus(selected, answerMap), [selected, answerMap]);
  const submitted = answers.filter(x => TEAMS.some(t => t.id === x.team_id)).length;
  const joinedTeam = TEAMS.find(t => t.id === teamId);
  const hasSubmitted = !!(teamId && answerMap.has(teamId));
  // Some zones show an additional local date (e.g. midnight in New York).
  // Include it in week 2, so no saved hour disappears from the calendar.
  const weeks = [calendar.dates.slice(0, 7), calendar.dates.slice(7)];
  const weekDays = weeks[week];
  const zones = useMemo(() => Array.from(new Set([...FAVORITE_ZONES, viewerZone, ...Intl.supportedValuesOf("timeZone")])), [viewerZone]);
  const filteredZones = zones.filter(value => !zoneFilter.trim() || zoneDisplay(value).toLowerCase().includes(zoneFilter.toLowerCase()) || value.toLowerCase().includes(zoneFilter.toLowerCase()) || value === zone);
  const completeSlots = submitted === 12 ? Object.values(SLOTS).flat().filter(id => slotStatus(id, answerMap).confirmed).length : 0;

  return (
    <main style={{ fontFamily: font }} className="min-h-screen bg-[#f5f5f7] text-[#1d1d1f] antialiased">
      <header className="sticky top-0 z-30 border-b border-black/[0.06] bg-white/80 backdrop-blur-2xl">
        <div className="mx-auto flex h-[64px] max-w-7xl items-center justify-between px-4 sm:px-7">
          <div className="flex items-center gap-3">
            <div className="grid h-9 w-9 place-items-center rounded-[12px] bg-[#0b6b45] text-white"><CalendarDays size={18}/></div>
            <div><p className="text-[15px] font-semibold leading-4">Draft Scheduler</p><p className="mt-0.5 text-[11px] font-medium text-[#86868b]">12-team fantasy league</p></div>
          </div>
          <div className="flex items-center gap-2 text-[12px] font-medium text-[#74747b]"><span className={"h-2 w-2 rounded-full " + (error ? "bg-orange-400" : "bg-[#34c759]")}/>{loading ? "Connecting" : error ? "Connection issue" : "Shared live poll"}</div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 pb-20 pt-9 sm:px-7 sm:pt-12">
        <section className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
          <div>
            <p className="text-[13px] font-semibold text-[#0b6b45]">October 8 – 21, 2026</p>
            <h1 className="mt-2 text-[36px] font-semibold leading-[1.04] tracking-[-0.05em] sm:text-[52px]">Find our draft window.</h1>
            <p className="mt-3 max-w-2xl text-[15px] leading-6 text-[#6e6e73] sm:text-[17px]">Choose ✓ when you can attend or × when you cannot—even if someone else has already said no. Grey shows an existing conflict, but everyone still gets a vote.</p>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:min-w-[290px]">
            <div className="rounded-[20px] border border-black/[0.06] bg-white p-4 shadow-sm"><p className="text-[12px] font-medium text-[#86868b]">Managers started</p><p className="mt-1 text-[29px] font-semibold tracking-[-0.04em]">{submitted}<span className="text-[17px] font-medium text-[#a0a0a5]">/12</span></p></div>
            <div className="rounded-[20px] border border-black/[0.06] bg-white p-4 shadow-sm"><p className="text-[12px] font-medium text-[#86868b]">Fully open hours</p><p className="mt-1 text-[29px] font-semibold tracking-[-0.04em] text-[#0b6b45]">{completeSlots}<span className="ml-1 text-[11px] font-medium text-[#86868b]">confirmed</span></p></div>
          </div>
        </section>


        <section className="mt-7 rounded-[24px] border border-black/[0.06] bg-white p-5 shadow-sm sm:p-6">
          <div className="flex flex-wrap items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-[14px] bg-[#e9f4ec] text-[#0b6b45]"><Users size={19}/></span>
            <div className="flex-1">
              <h2 className="text-[18px] font-semibold tracking-[-0.02em]">1. Choose your name</h2>
              <p className="mt-1 text-[12px] leading-5 text-[#86868b]">Answer ✓ or × for any hour, including grey ones. See how many hours still need answers and how many edits need saving.</p>
            </div>
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <select aria-label="Choose your name" disabled={saving} value={teamId ?? ""} onChange={e => selectTeam(e.target.value ? Number(e.target.value) : null)} className="min-w-[200px] flex-1 rounded-[13px] border border-[#dedee3] bg-[#f8f8fa] px-3 py-3 text-[14px] font-medium outline-none focus:border-[#0b6b45]">
              <option value="">Select your name…</option>
              {TEAMS.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
            {teamId && <button type="button" onClick={() => selectTeam(null)} disabled={saving} className="grid h-11 w-11 shrink-0 place-items-center rounded-[13px] bg-[#f3f3f5] text-[#86868b]" aria-label="Clear selection"><X size={18}/></button>}
            <button type="button" disabled={!teamId || saving} onClick={save} className="inline-flex h-11 min-w-[170px] items-center justify-center gap-2 rounded-[13px] bg-[#0b6b45] px-5 text-[13px] font-semibold text-white transition hover:bg-[#09593a] disabled:cursor-not-allowed disabled:opacity-45">
              {saving ? <Loader2 size={16} className="animate-spin"/> : dirty || !hasSubmitted ? <Save size={16}/> : <CheckCircle2 size={16}/>}
              {saving ? "Saving…" : dirty || !hasSubmitted ? "Save availability" + (unsavedChanges ? " (" + unsavedChanges + ")" : "") : "Saved — edit anytime"}
            </button>
          </div>
          <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
            <span className="text-[12px] text-[#86868b]">{joinedTeam ? (hasSubmitted ? "Editing " : "First response for ") + joinedTeam.name : "Select your name to start."}</span>
            {teamId && <span className="text-[12px] font-medium text-[#86868b]">{blocked.length} blocked · {available.length} checked available</span>}
          </div>
          {teamId && (
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <div className="rounded-[15px] border border-[#e9e9ed] bg-[#f8f8fa] p-3.5">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-[12px] font-semibold text-[#66666e]">Undecided hours</p>
                  <span className="text-[23px] font-semibold tabular-nums tracking-[-0.04em] text-[#1d1d1f]">{undecidedHours}</span>
                </div>
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[#e7e7eb]">
                  <div role="progressbar" aria-label="Hours you have marked" aria-valuemin={0} aria-valuemax={ALL_IDS.size} aria-valuenow={decidedHours} className="h-full rounded-full bg-[#278459] transition-all" style={{ width: (decidedHours / ALL_IDS.size * 100) + "%" }}/>
                </div>
                <p className="mt-2 text-[11px] text-[#86868b]">{decidedHours} of {ALL_IDS.size} hours marked ✓ or ×</p>
              </div>
              <div className={"rounded-[15px] border p-3.5 " + (unsavedChanges ? "border-[#f2dfac] bg-[#fff9e9]" : "border-[#e9e9ed] bg-[#f8f8fa]")}>
                <div className="flex items-center justify-between gap-3">
                  <p className="text-[12px] font-semibold text-[#66666e]">Unsaved changes</p>
                  <span className={"text-[23px] font-semibold tabular-nums tracking-[-0.04em] " + (unsavedChanges ? "text-[#a8761c]" : "text-[#1d1d1f]")}>{unsavedChanges}</span>
                </div>
                <p className="mt-2 text-[11px] text-[#86868b]">{unsavedChanges ? "Press Save availability to share your updates." : hasSubmitted ? "All changes saved." : "No changes since selecting your name."}</p>
                <p className="mt-1 text-[10px] text-[#9999a0]">Reverting a selection reduces this count.</p>
              </div>
            </div>
          )}
          {teamId && <p className="mt-2 text-[11px] leading-5 text-[#929298]">Unmarked hours remain unanswered, even after you save. Please mark ✓ or × for each hour so we know where everyone stands.</p>}
          {success && <p className="mt-3 flex items-center gap-1.5 text-[12px] font-medium text-[#1f8551]"><Check size={15}/>{success}</p>}
          {error && <p role="alert" className="mt-3 text-[12px] font-medium text-[#b64646]">{error}</p>}
        </section>


        <section className="mt-7 rounded-[24px] border border-black/[0.06] bg-white p-4 shadow-[0_2px_25px_rgba(0,0,0,0.035)] sm:p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h2 className="text-[21px] font-semibold tracking-[-0.03em]">2. Two-week calendar</h2>
              <p className="mt-1 max-w-[535px] text-[12px] leading-5 text-[#86868b]">All dates and hours below are shown in your selected time zone. Everyone's ✓ and × answers refer to the same underlying instant, wherever they live.</p>
            </div>
            <div className="flex w-full flex-col gap-2 sm:w-auto sm:min-w-[275px]">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-[#86868b]">Display times in</p>
              <label className="flex items-center gap-2 rounded-[12px] bg-[#f5f5f7] px-3 py-2 text-[12px] font-medium">
                <Globe2 size={16} className="shrink-0 text-[#8e8e93]"/>
                <select aria-label="Choose any world time zone" value={zone} onChange={e => { setZone(e.target.value); setZoneFilter(""); }} className="w-full min-w-0 bg-transparent outline-none">
                  {filteredZones.map(value => <option key={value} value={value}>{zoneDisplay(value)}</option>)}
                </select>
              </label>
              <input aria-label="Search world time zones" type="search" placeholder="Search a city or time zone…" value={zoneFilter} onChange={e => setZoneFilter(e.target.value)} className="w-full rounded-[12px] border border-black/[0.07] bg-white px-3 py-2 text-[12px] outline-none focus:border-[#0b6b45]" />
              <button type="button" onClick={() => { setZone("Australia/Perth"); setZoneFilter(""); }} className="self-start rounded-full border border-[#cce7d7] bg-[#f0faf4] px-3 py-1.5 text-[11px] font-semibold text-[#147247] transition hover:bg-[#e2f5ea]">Use Perth time (AWST, UTC+8)</button>
            </div>
          </div>
          <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
            <div className="inline-flex rounded-[13px] bg-[#f2f2f7] p-1">
              {weeks.map((dates, index) => <button key={index} type="button" onClick={() => setWeek(index)} className={"rounded-[10px] px-3 py-2 text-[12px] font-semibold transition " + (week === index ? "bg-white text-[#1d1d1f] shadow-sm" : "text-[#7c7c83]")}>{dateLabel(dates[0])} – {dateLabel(dates[dates.length - 1])}</button>)}
            </div>
            <div className="flex items-center gap-3 text-[11px] text-[#86868b]">
              <span className="hidden sm:block">{lastUpdated && "Updated " + lastUpdated.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}</span>
              <button aria-label="Refresh availability" type="button" onClick={() => void reload()} className="grid h-9 w-9 place-items-center rounded-[11px] bg-[#f5f5f7] text-[#6e6e73] hover:bg-[#ececef]"><RefreshCw size={16} className={loading ? "animate-spin" : ""}/></button>
            </div>
          </div>
          <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-[11px] font-medium text-[#777980]">
            <span className="inline-flex items-center gap-1.5"><span className="inline-grid h-4 w-4 place-items-center rounded bg-[#dff4e8] text-[#087a48]"><Check size={11}/></span> Available</span>
            <span className="inline-flex items-center gap-1.5"><span className="inline-grid h-4 w-4 place-items-center rounded bg-[#ffe1e0] text-[#ad4141]"><X size={11}/></span> Your unavailable time</span>
            <span className="inline-flex items-center gap-1.5"><span className="h-4 w-4 rounded border border-[#e1e2e7] bg-[#eeeef1]"/> Someone else is unavailable · You can still respond</span>
            <span className="inline-flex items-center gap-1.5"><span className="h-4 w-4 rounded border border-[#e7e7ea] bg-white"/> Awaiting responses</span>
          </div>
          <div className="mt-3 overflow-x-auto rounded-[16px] border border-[#e9e9ed]">
            <div className={weekDays.length > 7 ? "min-w-[920px]" : "min-w-[800px]"}>
              <div className="grid bg-[#f9f9fb]" style={{ gridTemplateColumns: "90px repeat(" + weekDays.length + ", minmax(0, 1fr))" }}>
                <div className="flex items-center justify-center border-b border-r border-[#e9e9ed] p-2 text-center text-[10px] font-semibold text-[#9999a1]">{zoneDisplay(zone)}</div>
                {weekDays.map(day => {
                  const daySlots = calendar.byDay[day] ?? [];
                  const allAvailable = daySlots.length > 0 && daySlots.every(id => availableSet.has(id));
                  const allBlocked = daySlots.length > 0 && daySlots.every(id => blockedSet.has(id));
                  return <div key={day} className="border-b border-r border-[#e9e9ed] px-1 py-2 text-center last:border-r-0">
                    <p className="text-[12px] font-semibold">{dateLabel(day)}</p>
                    <div className="mt-1.5 flex items-center justify-center gap-1">
                      <button
                        disabled={!teamId}
                        type="button"
                        aria-label={allAvailable ? "Undo available all day on " + dateLabel(day) : "Available all day on " + dateLabel(day)}
                        aria-pressed={allAvailable}
                        title={allAvailable ? "Undo available for these listed local hours" : "Available for all listed hours on this local date"}
                        onClick={() => availableWholeDay(day)}
                        className={"rounded-lg border px-1.5 py-1 text-[9px] font-semibold transition disabled:cursor-not-allowed disabled:opacity-35 " + (allAvailable ? "border-[#16824e] bg-[#178450] text-white" : "border-[#bfe4cf] bg-[#eefaf2] text-[#13784a] hover:bg-[#d6f3e2]")}
                      >{allAvailable ? "Undo ✓" : "✓ All"}</button>
                      <button
                        disabled={!teamId}
                        type="button"
                        aria-label={allBlocked ? "Undo block all day on " + dateLabel(day) : "Block all day on " + dateLabel(day)}
                        aria-pressed={allBlocked}
                        title={allBlocked ? "Undo blocked for these listed local hours" : "Block all listed hours on this local date"}
                        onClick={() => wholeDay(day)}
                        className={"rounded-lg border px-1.5 py-1 text-[9px] font-semibold transition disabled:cursor-not-allowed disabled:opacity-35 " + (allBlocked ? "border-[#bc4949] bg-[#c65151] text-white" : "border-[#f4caca] bg-[#fff1f0] text-[#b44b4b] hover:bg-[#ffe0dc]")}
                      >{allBlocked ? "Undo ×" : "× All"}</button>
                    </div>
                  </div>;
                })}
              </div>
              {calendar.clocks.map(clock => <div key={clock} className="grid border-b border-[#efeff1] last:border-b-0" style={{ gridTemplateColumns: "90px repeat(" + weekDays.length + ", minmax(0, 1fr))" }}>
                <div className="flex min-h-[67px] flex-col items-center justify-center border-r border-[#ececf0] bg-[#fbfbfc] px-1 text-center">
                  <span className="text-[12px] font-semibold text-[#5f5f68]">{localClockLabel(clock)}</span>
                </div>
                {weekDays.map(day => {
                  const id = calendar.byClock[day]?.[clock];
                  if (!id) return <div key={day + "-" + clock} className="m-[3px] min-h-[61px] rounded-[11px] border border-dashed border-[#f0f0f3] bg-[#fafafb]" title="No draft time offered for this local hour" aria-label={dateLabel(day) + " " + localClockLabel(clock) + ": not an offered draft hour" />;
                  
                  const info = slotStatus(id, answerMap);
                  const myBlocked = !!teamId && blockedSet.has(id);
                  const myAvailable = !!teamId && availableSet.has(id);
                  const someoneElseBlocked = info.unavailable.some(person => person.id !== teamId);
                  const focused = selected === id;
                  const shade = myBlocked ? "border-[#f0b5b5] bg-[#ffeded]"
                    : someoneElseBlocked ? "border-[#e0e1e5] bg-[#eeeef1]"
                    : myAvailable || info.confirmed ? "border-[#c6e6d4] bg-[#e5f7ed]"
                    : "border-[#e9e9ed] bg-white";
                  return <div key={id} title={"Local: " + dateLabel(day) + " " + localClockLabel(clock) + " · Mountain: " + rangeLabel(id, 1, "America/Denver")} className={"m-[3px] flex min-h-[61px] flex-col items-center justify-center rounded-[11px] border px-1 py-1.5 transition-colors " + shade + (focused ? " ring-2 ring-[#5f7183] ring-offset-1" : "")}>
                    <div className="flex items-center justify-center gap-1">
                      <button type="button" aria-label={dateLabel(day) + " " + localClockLabel(clock) + " " + zoneDisplay(zone) + ": mark available"} aria-pressed={myAvailable} onClick={() => markSlot(id, "available")} disabled={!teamId}
                        className={"grid h-6 w-7 place-items-center rounded-[7px] border transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#268954] disabled:cursor-not-allowed disabled:opacity-40 " + (myAvailable ? "border-[#198452] bg-[#198452] text-white" : "border-[#bedaca] bg-white/80 text-[#15804c] hover:bg-[#e6f7ed]")}>
                        <Check size={15} strokeWidth={2.5}/>
                      </button>
                      <button type="button" aria-label={dateLabel(day) + " " + localClockLabel(clock) + " " + zoneDisplay(zone) + ": mark unavailable"} aria-pressed={myBlocked} onClick={() => markSlot(id, "blocked")} disabled={!teamId}
                        className={"grid h-6 w-7 place-items-center rounded-[7px] border transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#c34b4b] disabled:cursor-not-allowed disabled:opacity-40 " + (myBlocked ? "border-[#c55252] bg-[#c55252] text-white" : "border-[#f0c2c2] bg-white/80 text-[#ba5656] hover:bg-[#ffebeb]")}>
                        <X size={15} strokeWidth={2.5}/>
                      </button>
                    </div>
                    <button type="button" onClick={() => setSelected(id)} className={"mt-1 text-[10px] font-semibold tracking-tight " + (someoneElseBlocked ? "text-[#7a7c87]" : myBlocked ? "text-[#a84949]" : info.confirmed ? "text-[#18734b]" : "text-[#8b8b93]")}>
                      <span className="block">{info.available.length} ✓ · {info.unavailable.length} ×</span>
                      <span className="mt-0.5 block text-[9px] font-normal opacity-75">{12 - info.pending.length}/12 answered</span>
                    </button>
                  </div>;
                })}
              </div>)}
            </div>
          </div>
          <p className="mt-3 text-[11px] leading-5 text-[#929298]">Each column is a real local date in {zoneDisplay(zone)}. The ✓ All / × All buttons affect only hours offered on that local date. Grey means someone else answered ×, but you can still vote. All 12 must explicitly answer ✓ for a fully available hour.</p>
        </section>

        <section className="mt-5 grid gap-4 lg:grid-cols-[1.2fr_1fr]">
          <div className="rounded-[24px] border border-black/[0.06] bg-white p-5 sm:p-6">
            <p className="text-[12px] font-semibold text-[#0b6b45]">Selected hour</p>
            <h3 className="mt-1 text-[22px] font-semibold tracking-[-0.03em]">{rangeLabel(selected,1,zone)}</h3>
            <p className="mt-1 text-[12px] text-[#86868b]">Mountain Time: {rangeLabel(selected,1,"America/Denver")}</p>
            <div className="mt-4 grid grid-cols-3 gap-2">{[
              {label:"Can attend",value:currentInfo.available.length, color:"text-[#137e4b]"},
              {label:"Cannot attend",value:currentInfo.unavailable.length,color:"text-[#ba5757]"},
              {label:"Awaiting reply",value:currentInfo.pending.length,color:"text-[#86868b]"}
            ].map(x=><div className="rounded-[13px] bg-[#f7f7f9] p-3" key={x.label}><p className={"text-[25px] font-semibold tracking-tight "+x.color}>{x.value}</p><p className="mt-0.5 text-[11px] text-[#86868b]">{x.label}</p></div>)}</div>
            <p className="mt-5 text-[12px] font-semibold">Available ✓</p>
            <div className="mt-2 flex flex-wrap gap-2">{currentInfo.available.length ? currentInfo.available.map(t=><TeamPill key={t.id} team={t} mode="good"/>) : <span className="text-[12px] text-[#86868b]">No saved yes responses for this hour yet.</span>}</div>
            <p className="mt-4 text-[12px] font-semibold">Unavailable ×</p>
            <div className="mt-2 flex flex-wrap gap-2">{currentInfo.unavailable.length ? currentInfo.unavailable.map(t=><TeamPill key={t.id} team={t} mode="bad"/>) : <span className="text-[12px] text-[#86868b]">No saved conflicts for this hour.</span>}</div>
            <p className="mt-4 text-[12px] font-semibold">No answer for this hour</p>
            <div className="mt-2 flex flex-wrap gap-2">{currentInfo.pending.length ? currentInfo.pending.map(t=><TeamPill key={t.id} team={t}/>) : <span className="text-[12px] font-medium text-[#248052]">All 12 managers answered this hour.</span>}</div>
          </div>
          <div className="rounded-[24px] border border-black/[0.06] bg-white p-5 sm:p-6">
            <div className="flex items-center justify-between"><h3 className="text-[18px] font-semibold tracking-[-0.02em]">League responses</h3><p className="text-[12px] text-[#86868b]">{submitted}/12 started</p></div>
            <div className="mt-4 grid grid-cols-2 gap-2">
              {TEAMS.map(t=>{
                const response = answerMap.get(t.id);
                const count = response ? response.blocked_slots.length + response.available_slots.length : 0;
                const complete = count === ALL_IDS.size;
                return <div key={t.id} className="flex items-center gap-2.5 rounded-[12px] bg-[#f8f8fa] px-3 py-2.5">
                  <span className={"grid h-8 w-8 shrink-0 place-items-center rounded-full text-[10px] font-bold "+(complete ? "bg-[#dff2e7] text-[#167248]" : response ? "bg-[#fff2d9] text-[#aa7a26]" : "bg-[#ebebef] text-[#909098]")}>{complete ? <Check size={15}/> : t.short.slice(0,3)}</span>
                  <div className="min-w-0">
                    <p className="truncate text-[11px] font-semibold">{t.name}</p>
                    <p className={"text-[10px] "+(complete ? "text-[#2a8855]" : response ? "text-[#a1782f]" : "text-[#a0a0a5]")}>{complete ? "All 210 answered" : response ? count + "/210 answered" : "Not started"}</p>
                  </div>
                </div>;
              })}
            </div>
          </div>
        </section>
        <p className="mt-6 text-center text-[11px] leading-5 text-[#a0a0a5]">Shared league scheduling poll · Times are one-hour blocks · Your selection can be edited anytime. This link uses team selection without login.</p>
      </div>
    </main>
  );
}
