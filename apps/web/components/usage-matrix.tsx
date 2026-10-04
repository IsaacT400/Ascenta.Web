"use client";

import { CalendarRange, Download, Plane, ReceiptText, Route, UsersRound } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { StatCard } from "@/components/stat-card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

// DEMO DATA — replace with authorized operational and billing sources.
const monthly = [
  { month: "Apr", rides: 18, spend: 5280 }, { month: "May", rides: 26, spend: 7440 },
  { month: "Jun", rides: 22, spend: 6810 }, { month: "Jul", rides: 31, spend: 9240 },
  { month: "Aug", rides: 29, spend: 8870 }, { month: "Sep", rides: 38, spend: 11940 },
];
const services = [
  { service: "Airport", rides: 17 }, { service: "Point-to-point", rides: 10 },
  { service: "Hourly", rides: 7 }, { service: "City-to-city", rides: 4 },
];
const travelers = [
  { name: "Jordan Lee", department: "Executive", rides: 8, spend: "$2,640" },
  { name: "Maya Chen", department: "Client Services", rides: 7, spend: "$1,980" },
  { name: "Daniel Ortiz", department: "Operations", rides: 6, spend: "$1,760" },
  { name: "Avery Brooks", department: "Executive", rides: 5, spend: "$1,440" },
];

const chartWidth = 680;
const chartHeight = 250;
const chartPadding = { top: 18, right: 20, bottom: 36, left: 54 };

function MonthlyMovementChart() {
  const innerWidth = chartWidth - chartPadding.left - chartPadding.right;
  const innerHeight = chartHeight - chartPadding.top - chartPadding.bottom;
  const xFor = (index: number) => chartPadding.left + (index / (monthly.length - 1)) * innerWidth;
  const yFor = (value: number) => chartPadding.top + innerHeight - (value / 12000) * innerHeight;
  const points = monthly.map((item, index) => `${xFor(index)},${yFor(item.spend)}`).join(" ");
  const areaPath = `M ${xFor(0)} ${chartPadding.top + innerHeight} L ${points.replaceAll(",", " ")} L ${xFor(monthly.length - 1)} ${chartPadding.top + innerHeight} Z`;

  return (
    <div className="mt-7 overflow-hidden" role="img" aria-label="Demo monthly transportation spend rising from $5,280 in April to $11,940 in September">
      <svg className="h-auto w-full" viewBox={`0 0 ${chartWidth} ${chartHeight}`} aria-hidden="true">
        <defs>
          <linearGradient id="ascenta-spend-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#b5965f" stopOpacity="0.34" />
            <stop offset="100%" stopColor="#b5965f" stopOpacity="0.03" />
          </linearGradient>
        </defs>
        {[0, 4000, 8000, 12000].map((value) => {
          const y = yFor(value);
          return (
            <g key={value}>
              <line x1={chartPadding.left} y1={y} x2={chartWidth - chartPadding.right} y2={y} stroke="#dfe3e4" strokeDasharray="4 5" />
              <text x={chartPadding.left - 10} y={y + 4} textAnchor="end" className="fill-[#7b8589] text-[11px]">{value === 0 ? "$0" : `$${value / 1000}k`}</text>
            </g>
          );
        })}
        <path d={areaPath} fill="url(#ascenta-spend-fill)" />
        <polyline points={points} fill="none" stroke="#9b7b43" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        {monthly.map((item, index) => (
          <g key={item.month}>
            <circle cx={xFor(index)} cy={yFor(item.spend)} r="4" fill="#f8f8f5" stroke="#9b7b43" strokeWidth="2.5" />
            <text x={xFor(index)} y={chartHeight - 10} textAnchor="middle" className="fill-[#68747a] text-[11px] font-semibold">{item.month}</text>
          </g>
        ))}
      </svg>
      <div className="mt-2 flex items-center justify-end gap-2 text-xs font-semibold text-[#68747a]"><span className="size-2 rounded-full bg-[#9b7b43]" /> Transportation spend · DEMO</div>
    </div>
  );
}

function ServiceMixChart() {
  const maxRides = 20;

  return (
    <div className="mt-8 space-y-6" role="img" aria-label="Demo rides by service: Airport 17, Point-to-point 10, Hourly 7, City-to-city 4">
      {services.map((item) => (
        <div key={item.service}>
          <div className="mb-2 flex items-center justify-between gap-4 text-sm">
            <span className="font-semibold text-[#26363e]">{item.service}</span>
            <span className="tabular-nums text-[#68747a]">{item.rides}</span>
          </div>
          <div className="h-3 overflow-hidden rounded-full bg-[#edf0ef]">
            <div className="h-full rounded-full bg-[#17394a]" style={{ width: `${(item.rides / maxRides) * 100}%` }} />
          </div>
        </div>
      ))}
      <p className="pt-1 text-right text-xs font-semibold text-[#7b8589]">38 rides total · DEMO</p>
    </div>
  );
}

export function UsageMatrix() {
  function exportReport() {
    const rows = [
      ["Month", "Rides", "Transportation spend (USD)"],
      ...monthly.map((item) => [item.month, String(item.rides), String(item.spend)]),
    ];
    const csv = rows.map((row) => row.map((cell) => `"${cell}"`).join(",")).join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = "ascenta-demo-usage-report.csv";
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div>
      <div className="flex flex-col gap-4 rounded-2xl border border-[#dce1e3] bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-3 sm:flex-row">
          <Select defaultValue="six-months"><SelectTrigger className="h-10 w-full rounded-xl bg-white sm:w-[190px]"><CalendarRange /><SelectValue /></SelectTrigger><SelectContent><SelectItem value="thirty-days">Last 30 days</SelectItem><SelectItem value="quarter">This quarter</SelectItem><SelectItem value="six-months">Last 6 months</SelectItem><SelectItem value="year">This year</SelectItem></SelectContent></Select>
          <Select defaultValue="all"><SelectTrigger className="h-10 w-full rounded-xl bg-white sm:w-[190px]"><UsersRound /><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">All departments</SelectItem><SelectItem value="executive">Executive</SelectItem><SelectItem value="operations">Operations</SelectItem><SelectItem value="client">Client Services</SelectItem></SelectContent></Select>
        </div>
        <Button variant="outline" className="h-10 rounded-xl bg-white" onClick={exportReport}><Download /> Export report</Button>
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total rides" value="38" detail="+9 from last month" icon={Route} tone="dark" />
        <StatCard label="Transportation spend" value="$11,940" detail="DEMO financial data" icon={ReceiptText} />
        <StatCard label="Airport rides" value="17" detail="45% of total usage" icon={Plane} />
        <StatCard label="Active travelers" value="12" detail="Across 4 departments" icon={UsersRound} />
      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-[1.5fr_1fr]">
        <section className="rounded-[1.25rem] border border-[#dce1e3] bg-white p-5 sm:p-6">
          <div><p className="text-xs font-bold tracking-[.12em] text-[#7b8589] uppercase">Monthly movement</p><h2 className="mt-1 font-display text-2xl tracking-[-.025em]">Rides and transportation spend</h2></div>
          <MonthlyMovementChart />
        </section>

        <section className="rounded-[1.25rem] border border-[#dce1e3] bg-white p-5 sm:p-6">
          <div><p className="text-xs font-bold tracking-[.12em] text-[#7b8589] uppercase">Service mix</p><h2 className="mt-1 font-display text-2xl tracking-[-.025em]">Rides by service</h2></div>
          <ServiceMixChart />
        </section>
      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-[1.1fr_.9fr]">
        <section className="overflow-hidden rounded-[1.25rem] border border-[#dce1e3] bg-white">
          <div className="border-b border-[#e1e5e6] p-5 sm:p-6"><p className="text-xs font-bold tracking-[.12em] text-[#7b8589] uppercase">Traveler usage</p><h2 className="mt-1 font-display text-2xl tracking-[-.025em]">Most frequent travelers</h2></div>
          <Table><TableHeader className="bg-[#f7f8f6]"><TableRow><TableHead className="pl-6 text-[10px] font-bold tracking-[.1em] text-[#7c878b] uppercase">Traveler</TableHead><TableHead className="text-[10px] font-bold tracking-[.1em] text-[#7c878b] uppercase">Department</TableHead><TableHead className="text-[10px] font-bold tracking-[.1em] text-[#7c878b] uppercase">Rides</TableHead><TableHead className="pr-6 text-right text-[10px] font-bold tracking-[.1em] text-[#7c878b] uppercase">Spend</TableHead></TableRow></TableHeader><TableBody>{travelers.map((item) => <TableRow key={item.name}><TableCell className="py-4 pl-6 font-semibold">{item.name}</TableCell><TableCell className="py-4 text-[#68747a]">{item.department}</TableCell><TableCell className="py-4">{item.rides}</TableCell><TableCell className="py-4 pr-6 text-right font-semibold">{item.spend}</TableCell></TableRow>)}</TableBody></Table>
        </section>
        <section className="rounded-[1.25rem] border border-[#dce1e3] bg-[#07141d] p-6 text-white">
          <p className="text-xs font-bold tracking-[.12em] text-[#d9c394] uppercase">Popular routes</p><h2 className="mt-2 font-display text-2xl">Where your team moves</h2>
          <div className="mt-7 space-y-5">
            {[{ route: "JFK → Midtown Manhattan", rides: 9 }, { route: "LGA → Financial District", rides: 6 }, { route: "Midtown → Teterboro FBO", rides: 4 }].map((item, index) => <div key={item.route} className="flex items-center gap-4"><span className="grid size-8 place-items-center rounded-full border border-white/15 text-xs text-white/55">0{index + 1}</span><span className="flex-1 text-sm font-semibold">{item.route}</span><span className="text-xs text-white/48">{item.rides} rides</span></div>)}
          </div>
          <p className="mt-8 border-t border-white/10 pt-5 text-xs leading-5 text-white/42">All values are fictional DEMO DATA. Financial definitions and authorization scopes remain to be confirmed.</p>
        </section>
      </div>
    </div>
  );
}
