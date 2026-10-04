import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, BarChart3, Building2, CalendarDays, CircleDollarSign, FileText, Plane, ReceiptText, UsersRound } from "lucide-react";

import { DashboardShell } from "@/components/dashboard-shell";
import { AuthGate } from "@/components/auth-gate";
import { StatCard } from "@/components/stat-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export const metadata: Metadata = { title: "Corporate Dashboard" };

// DEMO DATA — fictional travelers, reservations, and account values.
const reservations = [
  { id: "AE-1042", traveler: "Jordan Lee", route: "JFK → Midtown", date: "Sep 22 · 10:30 AM", status: "Confirmed" },
  { id: "AE-1045", traveler: "Maya Chen", route: "LGA → Financial District", date: "Sep 23 · 8:15 AM", status: "Pending" },
  { id: "AE-1048", traveler: "Daniel Ortiz", route: "Midtown → Teterboro FBO", date: "Sep 24 · 2:00 PM", status: "Confirmed" },
  { id: "AE-1051", traveler: "Avery Brooks", route: "Manhattan → Stamford", date: "Sep 25 · 7:30 AM", status: "Quoted" },
];

export default function CorporatePage() {
  return (
    <AuthGate requiredRole="CORPORATE_ADMIN"><DashboardShell mode="corporate" active="Overview" title="Apex Consulting" description="Corporate transportation overview · DEMO DATA">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"><StatCard label="Rides this month" value="38" detail="+9 compared with August" icon={CalendarDays} tone="dark" /><StatCard label="Transportation spend" value="$11,940" detail="Provisional financial data" icon={CircleDollarSign} /><StatCard label="Active travelers" value="12" detail="Across 4 departments" icon={UsersRound} /><StatCard label="Open invoices" value="$2,140" detail="2 invoices pending" icon={ReceiptText} /></div>

      <section className="mt-5 grid overflow-hidden rounded-[1.5rem] bg-[#07141d] text-white lg:grid-cols-[1.2fr_.8fr]">
        <div className="p-7 sm:p-9"><div className="flex items-center gap-3"><BarChart3 className="size-5 text-[#d9c394]" /><p className="eyebrow text-[#d9c394]">Ascenta Usage Matrix</p></div><h2 className="mt-5 max-w-xl font-display text-4xl leading-tight tracking-[-.04em]">See how your transportation program moves.</h2><p className="mt-4 max-w-xl text-sm leading-6 text-white/58">Explore spend, travelers, routes, service mix, departments, and upcoming demand in one role-aware view.</p><Button asChild className="mt-7 rounded-full bg-white px-6 text-[#0b1a24] hover:bg-[#e8e4da]"><Link href="/corporate/usage">Open Usage Matrix <ArrowRight /></Link></Button></div>
        <div className="border-t border-white/10 bg-[#0b1f2b] p-7 lg:border-t-0 lg:border-l"><p className="text-xs font-bold tracking-[.12em] text-white/48 uppercase">September utilization</p><p className="mt-3 font-display text-5xl">76%</p><Progress value={76} className="mt-5 h-2 bg-white/10 [&>div]:bg-[#d9c394]" /><div className="mt-7 grid grid-cols-2 gap-4"><MiniStat label="Airport rides" value="17" icon={Plane} /><MiniStat label="Departments" value="4" icon={Building2} /></div></div>
      </section>

      <div className="mt-5 grid gap-5 xl:grid-cols-[1.4fr_.6fr]">
        <section id="reservations" className="overflow-hidden rounded-[1.25rem] border border-[#dce1e3] bg-white"><div className="flex items-center justify-between border-b border-[#e1e5e6] p-5 sm:p-6"><div><p className="text-xs font-bold tracking-[.12em] text-[#7b8589] uppercase">Operations</p><h2 className="mt-1 font-display text-2xl">Upcoming reservations</h2></div><Button variant="ghost" className="rounded-full">View all <ArrowRight /></Button></div><Table><TableHeader><TableRow className="bg-[#f7f8f6]"><TableHead className="pl-6">Traveler</TableHead><TableHead>Route</TableHead><TableHead className="hidden lg:table-cell">Date</TableHead><TableHead className="pr-6 text-right">Status</TableHead></TableRow></TableHeader><TableBody>{reservations.map((item) => <TableRow key={item.id}><TableCell className="pl-6"><p className="font-semibold">{item.traveler}</p><p className="text-xs text-[#889195]">{item.id}</p></TableCell><TableCell>{item.route}</TableCell><TableCell className="hidden text-[#68747a] lg:table-cell">{item.date}</TableCell><TableCell className="pr-6 text-right"><Badge variant="outline" className={item.status === "Confirmed" ? "border-[#cfe0d3] bg-[#edf4ee] text-[#3e6346]" : item.status === "Pending" ? "border-[#ded3b9] bg-[#faf7ef] text-[#7a633c]" : "border-[#cfdae0] bg-[#eff4f6] text-[#456271]"}>{item.status}</Badge></TableCell></TableRow>)}</TableBody></Table></section>
        <section id="invoices" className="rounded-[1.25rem] border border-[#dce1e3] bg-white p-5 sm:p-6"><div className="flex items-center justify-between"><div><p className="text-xs font-bold tracking-[.12em] text-[#7b8589] uppercase">Billing</p><h2 className="mt-1 font-display text-2xl">Invoices</h2></div><FileText className="size-5 text-[#9b7b43]" /></div><div className="mt-6 space-y-3">{[{ id: "INV-0926", value: "$1,480", state: "Due Sep 30" }, { id: "INV-0826", value: "$660", state: "Due Sep 22" }].map((item) => <div key={item.id} className="flex items-center justify-between rounded-xl bg-[#f3f5f4] p-4"><div><p className="font-semibold">{item.id}</p><p className="text-xs text-[#778287]">{item.state}</p></div><p className="font-display text-xl">{item.value}</p></div>)}</div><Button variant="outline" className="mt-5 w-full rounded-xl bg-white">View billing</Button><p className="mt-4 text-[11px] leading-4 text-[#859095]">Amounts are fictional and no financial logic is active.</p></section>
      </div>
    </DashboardShell></AuthGate>
  );
}

function MiniStat({ label, value, icon: Icon }: { label: string; value: string; icon: typeof Plane }) { return <div className="rounded-xl border border-white/10 p-4"><Icon className="size-4 text-[#d9c394]" /><p className="mt-5 font-display text-2xl">{value}</p><p className="mt-1 text-xs text-white/45">{label}</p></div>; }
