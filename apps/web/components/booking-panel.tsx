"use client";

import Link from "next/link";
import { ArrowRight, CalendarDays, Clock3, MapPin, Users } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type BookingPanelProps = { compact?: boolean };

const tripTypes = [
  { value: "one-way", label: "One way" },
  { value: "airport", label: "Airport" },
  { value: "hourly", label: "Hourly" },
  { value: "round-trip", label: "Round trip" },
  { value: "city", label: "City to city" },
];

const prototypeMode = process.env.NEXT_PUBLIC_PROTOTYPE_MODE !== "false";

export function BookingPanel({ compact = false }: BookingPanelProps) {
  return (
    <div className="booking-panel min-w-0 w-full rounded-[1.5rem] border border-white/30 bg-white/96 p-5 text-[#15232a] shadow-[0_32px_100px_rgba(7,26,36,.34)] backdrop-blur-xl sm:p-6">
      <div className="flex items-start justify-between gap-5">
        <div>
          <p className="text-xs font-bold tracking-[.16em] text-[#527181] uppercase">Plan your ride</p>
          <h2 className="mt-1 font-display text-[1.7rem] tracking-[-.025em]">Where can we take you?</h2>
        </div>
        {prototypeMode && <span className="mt-1 rounded-full bg-[#e7eff1] px-3 py-1 text-[10px] font-bold tracking-[.1em] text-[#466574] uppercase">Demo</span>}
      </div>

      <Tabs defaultValue="one-way" className="mt-5">
        <TabsList className="scrollbar-none h-auto w-full justify-start gap-1 overflow-x-auto rounded-none border-b border-[#dfe3e5] bg-transparent p-0">
          {tripTypes.map((type) => (
            <TabsTrigger key={type.value} value={type.value} className="min-w-max rounded-none px-2.5 pb-3 text-[13px] font-semibold transition-colors duration-200 data-[state=active]:bg-transparent data-[state=active]:text-[#0d2a38] data-[state=active]:shadow-none after:bottom-0 after:bg-[#6f93a3]">
              {type.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {tripTypes.map((type) => (
          <TabsContent key={type.value} value={type.value} className="mt-5">
            {type.value === "hourly" ? (
              <div className="grid gap-3 sm:grid-cols-2">
                <Field icon={MapPin} label="Pickup" placeholder="Address, airport or hotel" />
                <Field icon={Clock3} label="Duration" placeholder="Select hours" />
              </div>
            ) : type.value === "airport" ? (
              <div className="grid gap-3 sm:grid-cols-2">
                <Field icon={MapPin} label="Airport" placeholder="Airport or flight number" />
                <Field icon={MapPin} label="Pickup / drop-off" placeholder="Address or hotel" />
              </div>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2">
                <Field icon={MapPin} label={type.value === "city" ? "Origin city" : "Pickup"} placeholder="Address, airport or hotel" />
                <Field icon={MapPin} label={type.value === "city" ? "Destination city" : "Destination"} placeholder="Where are you going?" />
              </div>
            )}
            <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
              <Field icon={CalendarDays} label="Date" placeholder="Select date" />
              <Field icon={Clock3} label="Time" placeholder="Select time" />
              <div className="col-span-2 sm:col-span-1"><Field icon={Users} label="Passengers" placeholder="1 passenger" /></div>
            </div>
          </TabsContent>
        ))}
      </Tabs>

      <Button asChild className="mt-5 h-12 w-full rounded-xl bg-[#0d2a38] text-[15px] text-white shadow-none transition-colors duration-200 hover:bg-[#355b6d]">
        <Link href="/booking">View ride options <ArrowRight className="size-4" /></Link>
      </Button>
      {!compact && <p className="mt-4 text-center text-xs leading-5 text-[#6c757a]">No payment is taken in this prototype.</p>}
    </div>
  );
}

function Field({ icon: Icon, label, placeholder }: { icon: typeof MapPin; label: string; placeholder: string }) {
  const inputId = `field-${label.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
  return (
    <div className="relative rounded-xl border border-[#d5e0e3] bg-white px-3.5 py-2 transition-[border-color,box-shadow] duration-200 focus-within:border-[#6f93a3] focus-within:ring-2 focus-within:ring-[#6f93a3]/18">
      <Label htmlFor={inputId} className="ml-7 block text-[10px] font-bold tracking-[.11em] text-[#727b80] uppercase">{label}</Label>
      <Icon className="absolute bottom-[15px] left-3.5 size-4 text-[#52798a]" strokeWidth={1.7} aria-hidden="true" />
      <Input id={inputId} placeholder={placeholder} className="h-6 border-0 bg-transparent py-0 pr-0 pl-7 text-[13px] font-medium shadow-none placeholder:text-[#9aa1a5] focus-visible:ring-0" />
    </div>
  );
}
