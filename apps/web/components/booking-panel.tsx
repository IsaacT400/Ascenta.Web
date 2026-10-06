"use client";

import { useMemo, useState, useSyncExternalStore, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, CalendarDays, Clock3, MapPin, Users } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { emptyJourneyDraft, getEmptyJourneyDraftSnapshot, getJourneyDraftSnapshot, parseJourneyDraft, saveJourneyDraft, subscribeJourneyDraft, type JourneyDraft } from "@/lib/journey-draft";

type BookingPanelProps = { compact?: boolean };
const modes = [
  { code: "ONE_WAY", label: "One way" },
  { code: "AIRPORT_TRANSFER", label: "Airport" },
  { code: "HOURLY", label: "By the hour" },
  { code: "ROUND_TRIP", label: "Round trip" },
  { code: "CITY_TO_CITY", label: "City to city" },
] as const;

export function BookingPanel({ compact = false }: BookingPanelProps) {
  const router = useRouter();
  const serialized = useSyncExternalStore(subscribeJourneyDraft, getJourneyDraftSnapshot, getEmptyJourneyDraftSnapshot);
  const draft = useMemo(() => parseJourneyDraft(serialized) ?? emptyJourneyDraft(), [serialized]);
  const [storageWarning, setStorageWarning] = useState(false);

  function update<K extends keyof JourneyDraft>(key: K, value: JourneyDraft[K]) {
    // eslint-disable-next-line react-hooks/purity -- Called only from a user input event to refresh draft expiry.
    const next = { ...draft, [key]: value, updatedAt: Date.now() };
    setStorageWarning(!saveJourneyDraft(next));
  }

  function continueToBooking(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!draft.pickupAddress.trim() || (draft.serviceTypeCode !== "HOURLY" && !draft.destinationAddress.trim()) || (draft.serviceTypeCode === "HOURLY" && Number(draft.durationHours) <= 0) || !draft.pickupDate || !draft.pickupTime) return;
    if (!saveJourneyDraft(draft)) {
      setStorageWarning(true);
      return;
    }
    router.push("/booking");
  }

  return (
    <form onSubmit={continueToBooking} className="booking-panel w-full rounded-2xl border border-white/70 bg-white p-5 text-[#001030] shadow-[0_24px_80px_rgba(0,16,48,.2)] sm:p-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div><p className="eyebrow text-[#3270bf]">Start a journey</p><h2 className="mt-2 font-display text-2xl tracking-[-.025em] sm:text-3xl">Where would you like to go?</h2></div>
        <span className="mb-1 text-xs text-[#53627a]">Request only · no payment</span>
      </div>
      <div role="group" aria-label="Journey type" className="mt-5 grid w-full grid-cols-2 gap-1 sm:flex sm:overflow-x-auto">
        {modes.map((mode) => <button key={mode.code} type="button" aria-pressed={draft.serviceTypeCode === mode.code} onClick={() => update("serviceTypeCode", mode.code)} className={`min-h-11 min-w-0 rounded-md border px-2 text-xs font-semibold transition-colors sm:shrink-0 sm:rounded-none sm:border-x-0 sm:border-t-0 ${draft.serviceTypeCode === mode.code ? "border-[#c6defc] bg-[#eaf2fc] text-[#001030]" : "border-transparent text-[#53627a] hover:bg-[#f7f9fd]"}`}>{mode.label}</button>)}
      </div>
      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <JourneyField id="home-pickup" label={draft.serviceTypeCode === "AIRPORT_TRANSFER" ? "Airport or pickup" : "Pickup"} icon={MapPin} value={draft.pickupAddress} placeholder="Address, airport or hotel" onChange={(value) => update("pickupAddress", value)} required />
        {draft.serviceTypeCode === "HOURLY" ? <JourneyField id="home-duration" label="Requested duration (hours)" icon={Clock3} type="number" step="any" value={draft.durationHours} placeholder="Enter hours" onChange={(value) => update("durationHours", value)} required /> : <JourneyField id="home-destination" label="Destination" icon={MapPin} value={draft.destinationAddress} placeholder="Address or city" onChange={(value) => update("destinationAddress", value)} required />}
      </div>
      <div className="mt-3 grid gap-3 sm:grid-cols-[1fr_1fr_.7fr]">
        <JourneyField id="home-date" label="Pickup date" icon={CalendarDays} type="date" value={draft.pickupDate} onChange={(value) => update("pickupDate", value)} required />
        <JourneyField id="home-time" label="Local pickup time" icon={Clock3} type="time" value={draft.pickupTime} onChange={(value) => update("pickupTime", value)} required />
        <JourneyField id="home-passengers" label="Passengers" icon={Users} type="number" min="1" max="50" value={String(draft.passengerCount)} onChange={(value) => update("passengerCount", Math.max(1, Math.min(50, Number(value) || 1)))} required />
      </div>
      <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="max-w-md text-xs leading-5 text-[#53627a]">We’ll keep these details in this browser for 30 minutes while you prepare your request.</p>
        <Button type="submit" className="h-12 shrink-0 rounded-lg bg-[#3270bf] px-6 text-white hover:bg-[#245b9f]">Continue your request <ArrowRight className="size-4" /></Button>
      </div>
      {storageWarning && <p role="alert" className="mt-3 text-sm text-red-700">This browser could not save the journey. Check storage access and try again.</p>}
      {!compact && <p className="sr-only">Your journey is a request and is not confirmed until reviewed.</p>}
    </form>
  );
}

function JourneyField({ id, label, icon: Icon, value, onChange, ...inputProps }: {
  id: string; label: string; icon: typeof MapPin; value: string; onChange: (value: string) => void;
  type?: string; step?: string; placeholder?: string; min?: string; max?: string; required?: boolean;
}) {
  return <div className="relative rounded-lg border border-[#c7d5e7] bg-white px-3 py-2 focus-within:border-[#3270bf] focus-within:ring-2 focus-within:ring-[#3270bf]/20">
    <Label htmlFor={id} className="ml-7 block text-[11px] font-semibold text-[#53627a]">{label}</Label>
    <Icon className="absolute bottom-3.5 left-3 size-4 text-[#3270bf]" aria-hidden="true" />
    <Input id={id} value={value} onChange={(event) => onChange(event.target.value)} {...inputProps} className="h-8 border-0 bg-transparent py-0 pl-7 text-sm shadow-none focus-visible:ring-0" />
  </div>;
}
