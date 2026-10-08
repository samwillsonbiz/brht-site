"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  CalendarDays, Check, CheckCircle2, ChevronLeft, ChevronRight,
  Globe2, Loader2, RefreshCw, Save, Sparkles, Users, X,
} from "lucide-react";

type Team = { id: number; name: string; short: string };
type Answer = { team_id: number; blocked_slots: string[]; submitted_at: string; updated_at: string };
type SlotInfo = { available: Team[]; unavailable: Team[]; pending: Team[]; confirmed: boolean };
type WindowOption = { ids: string[]; available: number; blocked: number; pending: number };

const TEAMS: Team[] = [
  { id: 1, name: "Tim Donaghy's Parlays", short: "TDP" },
  { id: 4, name: "The Royal Jesters", short: "LAL" },
  { id: 5, name: "Donovan Klingon", short: "DON" },
  { id: 6, name: "Jason Kidd's Totaled Car", short: "DUI" },
  { id: 8, name: "Giddey's Kiddies", short: "ZDT" },
  { id: 9, name: "NonDisplaced Hardon", short: "HRD" },
  { id: 10, name: "Club Shai Shai", short: "CSS" },
  { id: 11, name: "Delusional Pistons Fan", short: "CADE" },
  { id: 12, name: "Giannis The Menace", short: "VAND" },
  { id: 13, name: "Edwards Scissorhands", short: "ESH" },
  { id: 14, name: "Talk of the Towns", short: "TOTT" },
  { id: 15, name: "New World Heathens", short: "NWH" },
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
    else available.push(team);
  }
  return { available, unavailable, pending, confirmed: available.length === 12 };
}
function tone(status: SlotInfo) {
  if (status.confirmed) return "border-[#a6dec2] bg-[#e2f7ec] text-[#167248] hover:bg-[#d4f3e2]";
  if (status.unavailable.length === 0) return "border-[#d6e7da] bg-[#f2f8f3] text-[#38835e] hover:bg-[#eaf4ec]";
  if (status.unavailable.length <= 2) return "border-[#f4dfa9] bg-[#fff5db] text-[#8b6917] hover:bg-[#ffefc5]";
  if (status.unavailable.length <= 4) return "border-[#fad1ae] bg-[#fff0e2] text-[#aa632d] hover:bg-[#ffe5ce]";
  return "border-[#f0cbcb] bg-[#fce9e9] text-[#aa4d50] hover:bg-[#f9dada]";
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
  const [dirty, setDirty] = useState(false);
  const [week, setWeek] = useState(0);
  const [selected, setSelected] = useState(SLOTS[START_DAY][10]);
  const [zone, setZone] = useState("America/Denver");
  const [viewerZone, setViewerZone] = useState("Australia/Perth");
  const [duration, setDuration] = useState(2);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  useEffect(() => {
    try {
      const detected = Intl.DateTimeFormat().resolvedOptions().timeZone;
      if (detected) setViewerZone(detected);
    } catch { /* default Perth */ }
  }, []);

  const reload = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const res = await fetch(API + "?select=team_id,blocked_slots,submitted_at,updated_at&order=team_id.asc", {
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
    const id = window.setInterval(() => void reload(true), 20000);
    return () => window.clearInterval(id);
  }, [reload]);

  const answerMap = useMemo(() => new Map(answers.map(a => [a.team_id, a])), [answers]);
  const selectTeam = (id: number | null) => {
    if (dirty && !window.confirm("Discard your unsaved availability changes?")) return;
    setTeamId(id);
    setBlocked(id ? (answerMap.get(id)?.blocked_slots ?? []).filter(s => ALL_IDS.has(s)) : []);
    setDirty(false); setSuccess(""); setError("");
  };
  const blockedSet = useMemo(() => new Set(blocked), [blocked]);
  const updateBlocked = (list: string[]) => { setBlocked(list); setDirty(true); setSuccess(""); };
  const toggle = (id: string) => {
    setSelected(id);
    if (!teamId) return;
    updateBlocked(blockedSet.has(id) ? blocked.filter(x => x !== id) : [...blocked, id]);
  };
  const wholeDay = (day: string) => {
    if (!teamId) return;
    const slots = SLOTS[day];
    const allMarked = slots.every(x => blockedSet.has(x));
    const next = allMarked ? blocked.filter(x => !slots.includes(x)) : Array.from(new Set([...blocked, ...slots]));
    updateBlocked(next);
  };
  const save = async () => {
    if (!teamId || saving) return;
    setSaving(true); setError(""); setSuccess("");
    const row = {
      team_id: teamId, blocked_slots: [...new Set(blocked)].filter(s => ALL_IDS.has(s)).sort(),
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
      setDirty(false); setSuccess("Saved! Your team is included in the results.");
      setLastUpdated(new Date());
    } catch (e) { setError(e instanceof Error ? e.message : "Unable to save."); }
    finally { setSaving(false); }
  };

  const currentInfo = useMemo(() => slotStatus(selected, answerMap), [selected, answerMap]);
  const submitted = answers.filter(x => TEAMS.some(t => t.id === x.team_id)).length;
  const joinedTeam = TEAMS.find(t => t.id === teamId);
  const hasSubmitted = !!(teamId && answerMap.has(teamId));
  const candidates = useMemo(() => {
    const options: WindowOption[] = [];
    for (const day of DAYS) {
      const list = SLOTS[day];
      for (let i = 0; i <= list.length - duration; i++) {
        const ids = list.slice(i, i + duration);
        if (Date.parse(ids[0]) < Date.now() - 1800000) continue;
        const statuses = ids.map(id => slotStatus(id, answerMap));
        const blockedPeople = new Set(statuses.flatMap(s => s.unavailable.map(t => t.id)));
        const pendingPeople = new Set(statuses.flatMap(s => s.pending.map(t => t.id)));
        options.push({
          ids, blocked: blockedPeople.size, pending: pendingPeople.size,
          available: 12 - blockedPeople.size - pendingPeople.size,
        });
      }
    }
    return options.sort((a,b) => a.blocked - b.blocked || b.available - a.available || a.ids[0].localeCompare(b.ids[0])).slice(0,5);
  }, [answerMap, duration]);
  const weeks = [DAYS.slice(0,7), DAYS.slice(7,14)];
  const zones = Array.from(new Set([viewerZone, "America/Denver", "America/Los_Angeles", "America/Chicago", "America/New_York", "Australia/Perth", "Europe/London"]));
  const zoneName = (z: string) => ({ "America/Denver":"Mountain Time", "America/Los_Angeles":"Pacific Time", "America/Chicago":"Central Time", "America/New_York":"Eastern Time", "Australia/Perth":"Perth Time", "Europe/London":"UK Time" } as Record<string,string>)[z] || z.replaceAll("_"," ");

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
            <p className="mt-3 max-w-2xl text-[15px] leading-6 text-[#6e6e73] sm:text-[17px]">Mark the times you <strong>cannot</strong> attend. We'll find the best overlap across all 12 teams, with no endless group chat.</p>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:min-w-[290px]">
            <div className="rounded-[20px] border border-black/[0.06] bg-white p-4 shadow-sm"><p className="text-[12px] font-medium text-[#86868b]">Submitted</p><p className="mt-1 text-[29px] font-semibold tracking-[-0.04em]">{submitted}<span className="text-[17px] font-medium text-[#a0a0a5]">/12</span></p></div>
            <div className="rounded-[20px] border border-black/[0.06] bg-white p-4 shadow-sm"><p className="text-[12px] font-medium text-[#86868b]">Full overlap</p><p className="mt-1 text-[29px] font-semibold tracking-[-0.04em] text-[#0b6b45]">{candidates.filter(c=>c.available===12).length}<span className="ml-1 text-[11px] font-medium text-[#86868b]">top slots</span></p></div>
          </div>
        </section>

        <section className="mt-7 grid gap-4 lg:grid-cols-[1.4fr_1fr]">
          <div className="rounded-[24px] border border-black/[0.06] bg-white p-5 shadow-[0_2px_25px_rgba(0,0,0,0.035)] sm:p-6">
            <div className="flex items-start gap-3"><div className="grid h-10 w-10 shrink-0 place-items-center rounded-[14px] bg-[#e9f4ec] text-[#0b6b45]"><Users size={19}/></div><div><h2 className="text-[18px] font-semibold tracking-[-0.02em]">Step 1. Choose your team</h2><p className="mt-1 text-[13px] leading-5 text-[#86868b]">Then tap the hours you are unavailable, or block an entire day. Unmarked hours count as available when you save.</p></div></div>
            <div className="mt-4 flex gap-2">
              <select aria-label="Choose your fantasy team" value={teamId ?? ""} onChange={e => selectTeam(e.target.value ? Number(e.target.value) : null)} className="min-w-0 flex-1 rounded-[13px] border border-[#dedee3] bg-[#f8f8fa] px-3 py-3 text-[14px] font-medium outline-none focus:border-[#0b6b45]">
                <option value="">Select your team…</option>{TEAMS.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
              {teamId && <button type="button" onClick={()=>selectTeam(null)} className="grid w-11 shrink-0 place-items-center rounded-[13px] bg-[#f3f3f5] text-[#86868b]" aria-label="Clear team"><X size={18}/></button>}
            </div>
            <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
              <span className="text-[12px] text-[#86868b]">{joinedTeam ? (hasSubmitted ? "Updating " : "First response for ") + joinedTeam.name : "No team selected"}</span>
              {teamId && <span className="text-[12px] font-medium text-[#b0604c]">{blocked.length} unavailable hours{dirty ? " · Unsaved changes" : ""}</span>}
            </div>
            <button type="button" disabled={!teamId || saving} onClick={save} className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-[14px] bg-[#0b6b45] px-5 py-3.5 text-[14px] font-semibold text-white shadow-sm transition hover:bg-[#09593a] disabled:cursor-not-allowed disabled:opacity-45">
              {saving ? <Loader2 size={17} className="animate-spin"/> : dirty || !hasSubmitted ? <Save size={17}/> : <CheckCircle2 size={17}/>}
              {saving ? "Saving…" : dirty || !hasSubmitted ? "Save my availability" : "Saved — update anytime"}
            </button>
            {success && <p className="mt-3 flex items-center gap-1.5 text-[12px] font-medium text-[#1f8551]"><Check size={15}/>{success}</p>}
            {error && <p role="alert" className="mt-3 text-[12px] font-medium text-[#b64646]">{error}</p>}
          </div>
          <div className="rounded-[24px] border border-black/[0.06] bg-white p-5 shadow-[0_2px_25px_rgba(0,0,0,0.035)] sm:p-6">
            <div className="flex items-center gap-2"><Sparkles size={20} className="text-[#0b6b45]"/><h2 className="text-[18px] font-semibold tracking-[-0.02em]">Best draft windows</h2></div>
            <div className="mt-3 flex items-center gap-2"><span className="text-[12px] text-[#86868b]">Draft length</span><select aria-label="Draft length" value={duration} onChange={e=>setDuration(Number(e.target.value))} className="rounded-lg border border-[#e6e6eb] bg-[#f7f7f9] px-2 py-1.5 text-[12px] font-semibold"><option value={1}>1 hour</option><option value={2}>2 hours</option><option value={3}>3 hours</option></select></div>
            <div className="mt-3 space-y-2">
              {submitted===0 && <p className="rounded-[13px] bg-[#f7f7f9] p-3 text-[13px] leading-5 text-[#86868b]">Waiting for the first team to submit. Suggestions will populate as responses come in.</p>}
              {submitted>0 && candidates.map((c,i) => <button key={c.ids[0]} type="button" onClick={()=>{setWeek(DAYS.indexOf(new Date(Date.parse(c.ids[0])-6*3600000).toISOString().slice(0,10))>=7?1:0);setSelected(c.ids[0]);}} className="flex w-full items-center justify-between gap-2 rounded-[13px] border border-[#e9e9ed] bg-[#fbfbfc] p-3 text-left hover:border-[#9acfb0] hover:bg-[#f4faf6]">
                <div><p className="text-[13px] font-semibold">{rangeLabel(c.ids[0],duration,zone)}</p><p className="mt-0.5 text-[11px] text-[#86868b]">{c.pending ? c.pending + " waiting to respond" : "All teams responded"}</p></div>
                <div className="shrink-0 text-right"><p className={"text-[14px] font-bold " + (c.available===12 ? "text-[#087c47]" : "text-[#6c6c73]")}>{c.available}/12</p><p className="text-[10px] text-[#86868b]">{c.blocked ? c.blocked + " blocked" : "No conflicts"}</p></div>
              </button>)}
            </div>
            <p className="mt-3 text-[11px] leading-4 text-[#929298]">Ranked by the fewest conflicts, then the most confirmed attendees. A green 12/12 means everyone has responded and can attend.</p>
          </div>
        </section>

        <section className="mt-7 rounded-[24px] border border-black/[0.06] bg-white p-4 shadow-[0_2px_25px_rgba(0,0,0,0.035)] sm:p-6">
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div><h2 className="text-[21px] font-semibold tracking-[-0.03em]">Two-week availability</h2><p className="mt-1 text-[13px] text-[#86868b]">Times shown in Mountain Time. Select a cell to see who is unavailable{teamId ? ", or to block it for your team" : ""}.</p></div>
            <div className="flex flex-wrap items-center gap-2">
              <label className="flex items-center gap-2 rounded-[11px] bg-[#f5f5f7] px-3 py-2 text-[12px] font-medium"><Globe2 size={15} className="text-[#8e8e93]"/><select aria-label="Convert selected time to" value={zone} onChange={e=>setZone(e.target.value)} className="min-w-0 max-w-[190px] bg-transparent outline-none">{zones.map(z=><option key={z} value={z}>{zoneName(z)}</option>)}</select></label>
              <button aria-label="Refresh availability" type="button" onClick={()=>void reload()} className="grid h-9 w-9 place-items-center rounded-[11px] bg-[#f5f5f7] text-[#6e6e73] hover:bg-[#ececef]"><RefreshCw size={16} className={loading?"animate-spin":""}/></button>
            </div>
          </div>
          <div className="mt-5 flex items-center justify-between gap-3">
            <div className="inline-flex rounded-[13px] bg-[#f2f2f7] p-1">
              <button onClick={()=>setWeek(0)} className={"rounded-[10px] px-4 py-2 text-[13px] font-semibold transition " + (week===0?"bg-white text-[#1d1d1f] shadow-sm":"text-[#7c7c83]")}>Oct 8 – 14</button>
              <button onClick={()=>setWeek(1)} className={"rounded-[10px] px-4 py-2 text-[13px] font-semibold transition " + (week===1?"bg-white text-[#1d1d1f] shadow-sm":"text-[#7c7c83]")}>Oct 15 – 21</button>
            </div>
            <div className="hidden items-center gap-2 text-[12px] text-[#86868b] sm:flex">{lastUpdated && "Updated " + lastUpdated.toLocaleTimeString([], {hour:"numeric",minute:"2-digit"})}</div>
            <div className="flex gap-1 sm:hidden"><button onClick={()=>setWeek(0)} disabled={week===0} className="grid h-9 w-9 place-items-center rounded-lg border border-[#eee] disabled:opacity-30"><ChevronLeft size={16}/></button><button onClick={()=>setWeek(1)} disabled={week===1} className="grid h-9 w-9 place-items-center rounded-lg border border-[#eee] disabled:opacity-30"><ChevronRight size={16}/></button></div>
          </div>
          <div className="mt-3 overflow-x-auto rounded-[15px] border border-[#e9e9ed]">
            <div className="min-w-[720px]">
              <div className="grid grid-cols-[76px_repeat(7,minmax(0,1fr))] bg-[#f9f9fb]">
                <div className="border-b border-r border-[#e9e9ed] p-3 text-[10px] font-semibold uppercase tracking-wider text-[#a1a1a6]">MT</div>
                {weeks[week].map(day=><div key={day} className="border-b border-r border-[#e9e9ed] p-2.5 text-center last:border-r-0"><p className="text-[12px] font-semibold">{dateLabel(day)}</p><button disabled={!teamId} onClick={()=>wholeDay(day)} className="mt-1 text-[10px] font-semibold text-[#0b6b45] hover:underline disabled:cursor-default disabled:text-[#b2b2b7]">{teamId ? (SLOTS[day].every(id=>blockedSet.has(id)) ? "Clear day" : "Block day") : "—"}</button></div>)}
              </div>
              {HOURS.map((hour,h)=><div key={hour} className="grid grid-cols-[76px_repeat(7,minmax(0,1fr))]">
                <div className="grid min-h-[50px] place-items-center border-b border-r border-[#ececf0] bg-[#fbfbfc] text-[11px] font-medium text-[#96969c]">{timeLabel(SLOTS[weeks[week][0]][h],"America/Denver")}</div>
                {weeks[week].map(day=>{
                  const id=SLOTS[day][h];
                  const s=slotStatus(id,answerMap);
                  const own=blockedSet.has(id) && !!teamId;
                  const active=selected===id;
                  return <button key={id} type="button" onClick={()=>toggle(id)} title={dateLabel(day)+" · "+timeLabel(id,"America/Denver")+"\n"+s.unavailable.map(t=>t.name).join(", ")} aria-label={dateLabel(day)+" "+timeLabel(id,"America/Denver")+", "+s.available.length+" confirmed free, "+s.unavailable.length+" unavailable, "+s.pending.length+" pending"} className={"group relative m-[3px] min-h-[44px] rounded-[9px] border text-center transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#0b6b45] " + tone(s) + (active?" ring-2 ring-[#0b6b45] ring-offset-1":"") + (own?" !border-[#d86d74] !bg-[#f7dadd] !text-[#9f333b]":"")}>
                    <span className="text-[12px] font-bold tracking-tight">{own ? "✕" : s.available.length + "/12"}</span>
                    <span className="block text-[9px] font-medium opacity-70">{own ? "Blocked" : s.pending ? s.pending+" pending" : s.unavailable.length ? s.unavailable.length+" out" : "All free"}</span>
                  </button>;
                })}
              </div>)}
            </div>
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-[11px] font-medium text-[#797980]">
            <span className="inline-flex items-center gap-1.5"><span className="h-3 w-3 rounded bg-[#e2f7ec] ring-1 ring-[#a6dec2]"/>12/12 available</span>
            <span className="inline-flex items-center gap-1.5"><span className="h-3 w-3 rounded bg-[#f2f8f3] ring-1 ring-[#d6e7da]"/>No known conflicts, pending</span>
            <span className="inline-flex items-center gap-1.5"><span className="h-3 w-3 rounded bg-[#fff5db] ring-1 ring-[#f4dfa9]"/>1–2 unavailable</span>
            <span className="inline-flex items-center gap-1.5"><span className="h-3 w-3 rounded bg-[#fce9e9] ring-1 ring-[#f0cbcb]"/>3+ unavailable</span>
            <span className="inline-flex items-center gap-1.5"><span className="h-3 w-3 rounded bg-[#f7dadd] ring-1 ring-[#d86d74]"/>Your blocked hour</span>
          </div>
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
            <p className="mt-5 text-[12px] font-semibold">Unavailable teams</p>
            <div className="mt-2 flex flex-wrap gap-2">{currentInfo.unavailable.length ? currentInfo.unavailable.map(t=><TeamPill key={t.id} team={t} mode="bad"/>) : <span className="text-[12px] text-[#86868b]">No submitted conflicts for this hour.</span>}</div>
            <p className="mt-4 text-[12px] font-semibold">Still to respond</p>
            <div className="mt-2 flex flex-wrap gap-2">{currentInfo.pending.length ? currentInfo.pending.map(t=><TeamPill key={t.id} team={t}/>) : <span className="text-[12px] font-medium text-[#248052]">All 12 teams have responded.</span>}</div>
          </div>
          <div className="rounded-[24px] border border-black/[0.06] bg-white p-5 sm:p-6">
            <div className="flex items-center justify-between"><h3 className="text-[18px] font-semibold tracking-[-0.02em]">League responses</h3><p className="text-[12px] text-[#86868b]">{submitted}/12</p></div>
            <div className="mt-4 grid grid-cols-2 gap-2">
              {TEAMS.map(t=><div key={t.id} className="flex items-center gap-2.5 rounded-[12px] bg-[#f8f8fa] px-3 py-2.5"><span className={"grid h-8 w-8 shrink-0 place-items-center rounded-full text-[10px] font-bold "+(answerMap.has(t.id)?"bg-[#dff2e7] text-[#167248]":"bg-[#ebebef] text-[#909098]")}>{answerMap.has(t.id)?<Check size={15}/>:t.short.slice(0,3)}</span><div className="min-w-0"><p className="truncate text-[11px] font-semibold">{t.name}</p><p className={"text-[10px] "+(answerMap.has(t.id)?"text-[#2a8855]":"text-[#a0a0a5]")}>{answerMap.has(t.id)?"Submitted":"Awaiting reply"}</p></div></div>)}
            </div>
          </div>
        </section>
        <p className="mt-6 text-center text-[11px] leading-5 text-[#a0a0a5]">Shared league scheduling poll · Times are one-hour blocks · Your selection can be edited anytime. This link uses team selection without login.</p>
      </div>
    </main>
  );
}
