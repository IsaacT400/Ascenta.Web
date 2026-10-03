import type { Metadata } from "next";
import { ArrowRight, CalendarDays, Clock3, MapPin, MapPinned, Plane, ReceiptText, Route } from "lucide-react";

import { DashboardShell } from "@/components/dashboard-shell";
import { StatCard } from "@/components/stat-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export const metadata: Metadata = { title: "Customer Dashboard" };

// DEMO DATA — fictional journeys for product evaluation only.
const history = [
  { id: "AE-1027", date: "Sep 12", route: "JFK → Midtown Manhattan", service: "Airport transfer", status: "Completed" },
  { id: "AE-1018", date: "Aug 29", route: "Midtown → Teterboro FBO", service: "Point-to-point", status: "Completed" },
  { id: "AE-1006", date: "Aug 18", route: "Manhattan → East Hampton", service: "City-to-city", status: "Completed" },
];

export default function DashboardPage() {
  return (
    <DashboardShell mode="customer" active="Overview" title="Good morning, Alex" description="Your transportation at a glance · DEMO DATA">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"><StatCard label="Upcoming rides" value="2" detail="Next ride in 4 days" icon={CalendarDays} tone="dark" /><StatCard label="Completed rides" value="14" detail="During the demo period" icon={Route} /><StatCard label="Saved locations" value="4" detail="Home, office, 2 favorites" icon={MapPinned} /><StatCard label="Receipts" value="14" detail="Available to review" icon={ReceiptText} /></div>

      <section id="upcoming" className="mt-5 overflow-hidden rounded-[1.5rem] border border-[#dce1e3] bg-white">
        <div className="grid lg:grid-cols-[1fr_330px]">
          <div className="p-6 sm:p-8">
            <div className="flex items-start justify-between gap-4"><div><p className="text-xs font-bold tracking-[.12em] text-[#8d7040] uppercase">Upcoming ride</p><h2 className="mt-2 font-display text-3xl tracking-[-.035em]">Airport arrival</h2></div><Badge className="bg-[#e8efe9] text-[#315a3c]">Confirmed</Badge></div>
            <div className="mt-8 grid gap-6 sm:grid-cols-2"><Detail icon={CalendarDays} label="Pickup" value="Sep 22, 2026 · 10:30 AM" /><Detail icon={Plane} label="Flight" value="AE Demo 248 · JFK" /><Detail icon={MapPin} label="Destination" value="The Plaza, New York" /><Detail icon={Clock3} label="Service" value="Airport transfer" /></div>
            <div className="mt-8 flex flex-wrap gap-3"><Button className="rounded-full bg-[#0b1a24] text-white">View ride details</Button><Button variant="outline" className="rounded-full bg-white">Modify request</Button></div>
          </div>
          <div className="relative min-h-[260px] bg-[#0b1a24] p-7 text-white"><div className="absolute inset-0 opacity-35 [background-image:linear-gradient(30deg,transparent_48%,rgba(217,195,148,.4)_49%,rgba(217,195,148,.4)_50%,transparent_51%),linear-gradient(150deg,transparent_48%,rgba(88,126,142,.35)_49%,rgba(88,126,142,.35)_50%,transparent_51%)] [background-size:54px_54px]" /><div className="relative flex h-full flex-col justify-between"><div className="flex items-center justify-between"><span className="text-xs font-bold tracking-[.12em] text-white/48 uppercase">Journey 01</span><Route className="size-5 text-[#d9c394]" /></div><div><p className="font-display text-2xl">JFK Airport</p><div className="my-3 flex items-center gap-3"><span className="size-2 rounded-full bg-[#d9c394]" /><span className="h-px flex-1 bg-white/20" /><span className="size-2 rounded-full border border-white/50" /></div><p className="font-display text-2xl">Midtown Manhattan</p></div></div></div>
        </div>
      </section>

      <div className="mt-5 grid gap-5 xl:grid-cols-[1.35fr_.65fr]">
        <section id="history" className="overflow-hidden rounded-[1.25rem] border border-[#dce1e3] bg-white"><div className="flex items-center justify-between border-b border-[#e1e5e6] p-5 sm:p-6"><div><p className="text-xs font-bold tracking-[.12em] text-[#7b8589] uppercase">Recent activity</p><h2 className="mt-1 font-display text-2xl">Ride history</h2></div><Button variant="ghost" className="rounded-full">View all <ArrowRight /></Button></div><Table><TableHeader><TableRow className="bg-[#f7f8f6]"><TableHead className="pl-6 text-xs">Date</TableHead><TableHead>Route</TableHead><TableHead className="hidden md:table-cell">Service</TableHead><TableHead className="pr-6 text-right">Status</TableHead></TableRow></TableHeader><TableBody>{history.map((ride) => <TableRow key={ride.id}><TableCell className="pl-6 text-[#6d797e]">{ride.date}</TableCell><TableCell><p className="font-semibold">{ride.route}</p><p className="text-xs text-[#879095]">{ride.id}</p></TableCell><TableCell className="hidden text-[#657178] md:table-cell">{ride.service}</TableCell><TableCell className="pr-6 text-right"><Badge variant="outline" className="border-[#cfe0d3] bg-[#edf4ee] text-[#3e6346]">{ride.status}</Badge></TableCell></TableRow>)}</TableBody></Table></section>
        <section id="locations" className="rounded-[1.25rem] border border-[#dce1e3] bg-white p-5 sm:p-6"><div className="flex items-center justify-between"><div><p className="text-xs font-bold tracking-[.12em] text-[#7b8589] uppercase">Saved locations</p><h2 className="mt-1 font-display text-2xl">Your places</h2></div><MapPinned className="size-5 text-[#9b7b43]" /></div><div className="mt-6 space-y-3">{[{ name: "Home", place: "Upper East Side, NY" }, { name: "Office", place: "Midtown Manhattan, NY" }, { name: "Preferred airport", place: "JFK International" }].map((item) => <div key={item.name} className="rounded-xl bg-[#f3f5f4] p-4"><p className="font-semibold">{item.name}</p><p className="mt-1 text-xs text-[#778287]">{item.place}</p></div>)}</div><Button variant="outline" className="mt-5 w-full rounded-xl bg-white">Manage locations</Button></section>
      </div>
      <p className="mt-6 text-xs leading-5 text-[#7d878b]">All journeys, names, dates, and account values on this page are fictional DEMO DATA.</p>
    </DashboardShell>
  );
}

function Detail({ icon: Icon, label, value }: { icon: typeof MapPin; label: string; value: string }) { return <div className="flex gap-3"><span className="grid size-9 shrink-0 place-items-center rounded-full bg-[#f0ece2] text-[#8d713f]"><Icon className="size-4" /></span><span><span className="block text-[10px] font-bold tracking-[.1em] text-[#7b8589] uppercase">{label}</span><span className="mt-1 block text-sm font-semibold">{value}</span></span></div>; }
