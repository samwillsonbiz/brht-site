"use client";

type Day = { date: string; projected: number; starters: unknown[]; benchGames: unknown[] };
type Weekly = { week: number; start: string; left: number; right: number; opponent: string };
type PlayerBar = { name: string; future: number; games: number };

function rounded(n: number) { return Math.round(n).toLocaleString("en-US"); }
function AxisLabel({x,y,text}: {x:number;y:number;text:string}) {
  return <text x={x} y={y} textAnchor="middle" fontSize="12" fill="currentColor" opacity=".6">{text}</text>;
}
export function CumulativeForecastChart({leftDays,rightDays,leftActual,rightActual,leftName,rightName}: {
  leftDays: Day[]; rightDays: Day[];
  leftActual: number; rightActual: number;
  leftName: string; rightName: string;
}) {
  const left = [leftActual], right = [rightActual];
  leftDays.forEach((d) => left.push(left[left.length - 1] + d.projected));
  rightDays.forEach((d) => right.push(right[right.length - 1] + d.projected));
  const max = Math.max(200, ...left, ...right) * 1.12;
  const width=760, height=260, l=58, r=22, t=16, b=38;
  const x=(i:number)=>l+(i/7)*(width-l-r);
  const y=(v:number)=>t+(height-t-b)*(1-v/max);
  const points=(values:number[])=>values.map((v,i)=>String(x(i))+","+String(y(v))).join(" ");
  return (
    <div className="rounded-[22px] border border-black/[0.06] bg-white p-4 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div><div className="text-xs font-bold uppercase tracking-widest text-[#0071e3]">Forecast trajectory</div>
          <h3 className="mt-1 text-lg font-semibold">Where the remaining week could finish</h3>
          <p className="mt-1 text-xs leading-5 text-black/45">Lines begin at today’s ESPN score and add future projected points. Not a historical score timeline.</p>
        </div>
        <div className="flex flex-wrap gap-3 text-[11px] font-semibold">
          <span className="max-w-[160px] truncate text-[#0071e3]">● {leftName}</span>
          <span className="max-w-[160px] truncate text-[#f05b52]">● {rightName}</span>
        </div>
      </div>
      <svg viewBox="0 0 760 260" className="mt-4 h-auto w-full" role="img" aria-label="Projected cumulative points from current live score through Sunday">
        {[0,.25,.5,.75,1].map((v)=>{const yy=y(max*v);return <g key={v}>
          <line x1={l} y1={yy} x2={width-r} y2={yy} stroke="currentColor" strokeOpacity=".08"/>
          <text x={l-10} y={yy+4} textAnchor="end" fontSize="11" fill="currentColor" opacity=".55">{rounded(max*v)}</text>
        </g>;})}
        <polyline points={points(left)} fill="none" stroke="#0071e3" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"/>
        <polyline points={points(right)} fill="none" stroke="#f05b52" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
        {left.map((v,i)=><circle key={"l"+i} cx={x(i)} cy={y(v)} r="3.5" fill="#0071e3" stroke="white" strokeWidth="1.5"/>)}
        {right.map((v,i)=><circle key={"r"+i} cx={x(i)} cy={y(v)} r="3" fill="#f05b52" stroke="white" strokeWidth="1.2"/>)}
        {["Now","Mon","Tue","Wed","Thu","Fri","Sat","Sun"].map((d,i)=><AxisLabel key={d} x={x(i)} y={height-10} text={d}/>)}
      </svg>
      <div className="mt-1 flex justify-between gap-3 text-xs font-semibold">
        <span className="text-[#0071e3]">{rounded(left[left.length-1])} projected final</span>
        <span className="text-[#f05b52]">{rounded(right[right.length-1])} projected final</span>
      </div>
    </div>
  );
}

export function SixWeekForecastChart({rows}: {rows: Weekly[]}) {
  const max = Math.max(1,...rows.flatMap((x)=>[x.left,x.right]));
  return <section className="rounded-[22px] border border-black/[0.06] bg-white p-5 sm:p-6">
    <div className="text-xs font-bold uppercase tracking-widest text-[#0071e3]">6-week score forecast</div>
    <h3 className="mt-1 text-lg font-semibold">Your schedule versus each opponent</h3>
    <p className="mt-1 text-xs text-black/45">Blue is your estimated final, coral is your opponent’s. Future weeks are entirely projections.</p>
    <div className="mt-6 grid grid-cols-3 gap-3 sm:grid-cols-6">
      {rows.map((row)=> <div key={row.week} className="min-w-0">
        <div className="flex h-[170px] items-end justify-center gap-1 rounded-t-xl border-b border-black/[0.08] bg-[#fafafa] px-1 pt-3 sm:h-[200px]">
          <div title={"My Week "+row.week+": "+rounded(row.left)} className="w-[42%] min-w-[10px] rounded-t-md bg-[#0071e3]" style={{height:String(Math.max(3,(row.left/max)*100))+"%"}}/>
          <div title={row.opponent+": "+rounded(row.right)} className="w-[42%] min-w-[10px] rounded-t-md bg-[#f05b52]" style={{height:String(Math.max(3,(row.right/max)*100))+"%"}}/>
        </div>
        <div className="mt-2 text-center text-xs font-semibold">Week {row.week}</div>
        <div className="mt-1 truncate text-center text-[10px] text-black/45" title={row.opponent}>{row.opponent}</div>
        <div className={"mt-1 text-center text-xs font-bold "+(row.left>=row.right?"text-emerald-700":"text-red-600")}>{row.left>=row.right?"+":""}{rounded(row.left-row.right)}</div>
      </div>)}
    </div>
    <div className="mt-4 flex justify-end gap-4 text-xs font-semibold"><span className="text-[#0071e3]">● My team</span><span className="text-[#f05b52]">● Opponents</span></div>
  </section>;
}

export function ContributionsChart({rows}: {rows: PlayerBar[]}) {
  const items=[...rows].sort((a,b)=>b.future-a.future).slice(0,13);
  const max=Math.max(1,...items.map((p)=>p.future));
  return <section className="rounded-[22px] border border-black/[0.06] bg-white p-5 sm:p-6">
    <div className="text-xs font-bold uppercase tracking-widest text-[#0071e3]">Player impact</div>
    <h3 className="mt-1 text-lg font-semibold">Where future points are coming from</h3>
    <div className="mt-5 space-y-3">
      {items.map((row)=><div key={row.name} className="grid grid-cols-[minmax(90px,1fr)_minmax(95px,1.5fr)_44px] items-center gap-3 text-xs">
        <div className="truncate font-medium" title={row.name}>{row.name}</div>
        <div className="h-4 rounded-md bg-[#f0f1f4]"><div className="h-4 rounded-md bg-[#0071e3]" style={{width:String(Math.max(0,100*row.future/max))+"%"}}/></div>
        <div className="text-right font-semibold">{rounded(row.future)}</div>
      </div>)}
    </div>
    <p className="mt-4 text-xs text-black/45">Shows usable projected starts after position and daily slot limits, not a raw sum of all scheduled games.</p>
  </section>;
}
