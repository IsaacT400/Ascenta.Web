"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, BriefcaseBusiness, CalendarDays, Check, Clock3, Luggage, MapPin, Plane, Users } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

// PLACEHOLDER — mode rules and vehicle capacities are not production business logic.
const modes = ["One Way", "Airport Transfer", "Hourly", "Round Trip", "City-to-City"];
const vehicles = [
  { name: "Executive SUV", seats: "Up to 3", luggage: "3 bags", note: "Quiet executive travel" },
  { name: "Premium SUV", seats: "Up to 5", luggage: "5 bags", note: "Extra room for people and luggage" },
  { name: "Executive Van", seats: "Up to 10", luggage: "10 bags", note: "Groups and coordinated movements" },
];

export function BookingWizard() {
  const [step, setStep] = useState(1);
  const [mode, setMode] = useState("One Way");
  const [vehicle, setVehicle] = useState("Executive SUV");
  const [pickup, setPickup] = useState("JFK Airport, Queens, NY");
  const [destination, setDestination] = useState("The Plaza, New York, NY");
  const progress = step * 25;

  return (
    <div className="grid min-w-0 gap-8 lg:grid-cols-[minmax(0,1fr)_340px]">
      <section className="min-w-0 rounded-[1.5rem] border border-[#dce1e3] bg-white p-5 shadow-[0_20px_70px_rgba(11,26,36,.07)] sm:p-8">
        <div className="flex items-center justify-between gap-4">
          <div><p className="text-xs font-bold tracking-[.14em] text-[#8c7040] uppercase">Step {step} of 4</p><h2 className="mt-1 font-display text-3xl tracking-[-.03em]">{["Plan your journey", "Trip details", "Choose a vehicle", "Review your ride"][step - 1]}</h2></div>
          <Badge variant="outline" className="border-[#d6c6a5] bg-[#faf6ee] text-[#80663b]">Demo</Badge>
        </div>
        <Progress value={progress} className="mt-6 h-1.5 bg-[#e8ebeb] [&>div]:bg-[#a6864e]" />

        <div className="mt-8 min-h-[380px]">
          {step === 1 && (
            <div>
              <Tabs value={mode} onValueChange={setMode} className="min-w-0">
                <TabsList className="scrollbar-none h-auto w-full max-w-full justify-start gap-2 overflow-x-auto bg-transparent p-0">
                  {modes.map((item) => <TabsTrigger key={item} value={item} className="min-w-max rounded-full border border-[#dbe0e2] px-4 py-2.5 data-[state=active]:border-[#0b1a24] data-[state=active]:bg-[#0b1a24] data-[state=active]:text-white">{item}</TabsTrigger>)}
                </TabsList>
              </Tabs>
              <div className="mt-8 grid gap-5 sm:grid-cols-2">
                <TextField label={mode === "Airport Transfer" ? "Airport or flight number" : mode === "City-to-City" ? "Origin city" : "Pickup location"} value={pickup} onChange={setPickup} icon={mode === "Airport Transfer" ? Plane : MapPin} />
                <TextField label={mode === "Hourly" ? "Pickup area" : mode === "City-to-City" ? "Destination city" : "Destination"} value={destination} onChange={setDestination} icon={MapPin} />
                <TextField label="Pickup date" value="September 22, 2026" icon={CalendarDays} />
                <TextField label={mode === "Hourly" ? "Start time" : "Pickup time"} value="10:30 AM" icon={Clock3} />
              </div>
              {mode === "Airport Transfer" && <div className="mt-5 rounded-xl border border-[#dfd3ba] bg-[#faf7f0] p-4 text-sm leading-6 text-[#66563b]">Flight-aware fields appear only when an airport journey is selected. Tracking and timing rules will be connected later.</div>}
            </div>
          )}

          {step === 2 && (
            <div className="grid gap-5 sm:grid-cols-2">
              <TextField label="Passengers" value="2 passengers" icon={Users} />
              <TextField label="Luggage" value="2 checked bags" icon={Luggage} />
              <TextField label="Primary traveler" value="Alex Morgan" icon={BriefcaseBusiness} />
              <TextField label="Contact number" value="(212) 555-0148" icon={Users} />
              <div className="sm:col-span-2"><Label htmlFor="requests" className="mb-2 block text-xs font-bold tracking-[.1em] text-[#6f7a7f] uppercase">Special requests</Label><textarea id="requests" rows={4} placeholder="Meet & greet, accessibility needs, child seat, signage, or other trip details" className="w-full rounded-xl border border-[#d9dfe1] bg-white p-4 text-sm outline-none transition focus:border-[#9b7b43] focus:ring-2 focus:ring-[#cbb580]/20" /></div>
            </div>
          )}

          {step === 3 && (
            <div className="grid gap-4">
              {vehicles.map((item) => (
                <button key={item.name} type="button" onClick={() => setVehicle(item.name)} className={`flex w-full flex-col gap-4 rounded-2xl border p-5 text-left transition sm:flex-row sm:items-center ${vehicle === item.name ? "border-[#9b7b43] bg-[#faf7f0] ring-2 ring-[#cbb580]/20" : "border-[#dce1e3] hover:border-[#aeb8bc]"}`}>
                  <span className={`grid size-11 shrink-0 place-items-center rounded-full ${vehicle === item.name ? "bg-[#0b1a24] text-white" : "bg-[#edf0f0] text-[#52636b]"}`}>{vehicle === item.name ? <Check className="size-5" /> : <span className="size-2.5 rounded-full border border-current" />}</span>
                  <span className="flex-1"><span className="block font-display text-xl">{item.name}</span><span className="mt-1 block text-sm text-[#758086]">{item.note}</span></span>
                  <span className="flex gap-4 text-xs font-semibold text-[#55646b]"><span>{item.seats}</span><span>{item.luggage}</span></span>
                </button>
              ))}
              <p className="text-xs leading-5 text-[#7d878b]">Vehicle categories, capacity, and amenities are placeholder data and must be confirmed before launch.</p>
            </div>
          )}

          {step === 4 && (
            <div>
              <div className="rounded-2xl border border-[#dce1e3] bg-[#f7f8f6] p-6">
                <div className="flex items-start justify-between"><div><p className="text-xs font-bold tracking-[.12em] text-[#8c7040] uppercase">Ride summary</p><h3 className="mt-2 font-display text-2xl">{mode}</h3></div><Badge className="bg-[#e8efe9] text-[#315a3c]">Review ready</Badge></div>
                <div className="mt-7 grid gap-6 sm:grid-cols-2">
                  <Summary label="Pickup" value={pickup} /><Summary label="Destination" value={destination} /><Summary label="Date & time" value="Sep 22, 2026 · 10:30 AM" /><Summary label="Vehicle" value={vehicle} /><Summary label="Passengers" value="2 travelers" /><Summary label="Pricing" value="To be confirmed" />
                </div>
              </div>
              <div className="mt-5 rounded-xl border border-[#d7c8a9] bg-[#faf7f0] p-4 text-sm leading-6 text-[#65563b]">This prototype does not create a reservation or process payment. Final pricing and confirmation rules will depend on the selected service and market.</div>
            </div>
          )}
        </div>

        <div className="mt-8 flex items-center justify-between border-t border-[#e3e6e7] pt-6">
          <Button variant="ghost" onClick={() => setStep((value) => Math.max(1, value - 1))} disabled={step === 1} className="rounded-full"><ArrowLeft /> Back</Button>
          {step < 4 ? <Button onClick={() => setStep((value) => Math.min(4, value + 1))} className="h-11 rounded-full bg-[#0b1a24] px-6 text-white">Continue <ArrowRight /></Button> : <Button asChild className="h-11 rounded-full bg-[#0b1a24] px-6 text-white"><Link href="/dashboard">Finish demo <ArrowRight /></Link></Button>}
        </div>
      </section>

      <aside className="h-fit min-w-0 rounded-[1.5rem] bg-[#07141d] p-6 text-white lg:sticky lg:top-24">
        <p className="eyebrow text-[#d9c394]">Your journey</p>
        <div className="mt-7 space-y-0">
          {["Route", "Trip details", "Vehicle", "Review"].map((label, index) => (
            <div key={label} className="flex gap-4"><div className="flex flex-col items-center"><span className={`grid size-8 place-items-center rounded-full border text-xs font-bold ${step > index + 1 ? "border-[#d9c394] bg-[#d9c394] text-[#07141d]" : step === index + 1 ? "border-white bg-white text-[#07141d]" : "border-white/20 text-white/42"}`}>{step > index + 1 ? <Check className="size-4" /> : index + 1}</span>{index < 3 && <span className="h-10 w-px bg-white/12" />}</div><span className={`pt-1.5 text-sm ${step === index + 1 ? "font-semibold text-white" : "text-white/48"}`}>{label}</span></div>
          ))}
        </div>
        <div className="mt-6 border-t border-white/10 pt-5 text-xs leading-5 text-white/44">Demo data only. Locations are illustrative and no availability is being checked.</div>
      </aside>
    </div>
  );
}

function TextField({ label, value, icon: Icon, onChange }: { label: string; value: string; icon: typeof MapPin; onChange?: (value: string) => void }) {
  const id = label.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  return <div><Label htmlFor={id} className="mb-2 block text-xs font-bold tracking-[.1em] text-[#6f7a7f] uppercase">{label}</Label><div className="relative"><Icon className="absolute top-1/2 left-4 size-4 -translate-y-1/2 text-[#9b7b43]" /><Input id={id} value={value} onChange={(event) => onChange?.(event.target.value)} readOnly={!onChange} className="h-12 rounded-xl border-[#d9dfe1] pl-11 text-sm shadow-none focus-visible:border-[#9b7b43] focus-visible:ring-[#cbb580]/20" /></div></div>;
}

function Summary({ label, value }: { label: string; value: string }) { return <div><p className="text-[10px] font-bold tracking-[.12em] text-[#7b8589] uppercase">{label}</p><p className="mt-1 text-sm font-semibold text-[#172832]">{value}</p></div>; }
