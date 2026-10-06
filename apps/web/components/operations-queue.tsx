"use client";

import { useEffect, useState } from "react";
import { CalendarDays, MapPin, RotateCw } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getOperationsReservations } from "@/lib/api-client";
import type { ReservationView } from "@ascenta/shared";

export function OperationsQueue() {
  const [items, setItems] = useState<ReservationView[] | null>(null);
  const [error, setError] = useState(false);
  const refresh = () => { setError(false); void getOperationsReservations().then(setItems).catch(() => setError(true)); };
  useEffect(() => { void getOperationsReservations().then(setItems).catch(() => setError(true)); }, []);

  return <section aria-labelledby="queue-heading">
    <div className="flex flex-wrap items-end justify-between gap-4"><div><p className="eyebrow text-[#3270bf]">Internal operations</p><h2 id="queue-heading" className="mt-2 font-display text-3xl text-[#001030]">Request queue</h2><p className="mt-2 text-sm text-[#53627a]">Requests received by the API. No request is confirmed or dispatched here.</p></div><Button type="button" variant="outline" onClick={refresh} className="rounded-lg bg-white"><RotateCw className="size-4" /> Refresh</Button></div>
    {error && <div role="alert" className="mt-5 rounded-xl border border-red-200 bg-white p-5 text-sm text-red-800">The operations queue could not be loaded. Check the API connection and try again.</div>}
    {!items && !error && <div className="mt-5 rounded-xl border border-[#d5dfec] bg-white p-5 text-sm text-[#53627a]" aria-live="polite">Loading requests…</div>}
    {items?.length === 0 && <div className="mt-5 rounded-xl border border-[#d5dfec] bg-white p-7"><h3 className="font-display text-2xl text-[#001030]">No requests received</h3><p className="mt-2 text-sm text-[#53627a]">New customer requests appear here after they are persisted.</p></div>}
    {!!items?.length && <div className="mt-5 space-y-3">{items.map((item) => <article key={item.id} className="rounded-xl border border-[#d5dfec] bg-white p-5 sm:p-6"><div className="flex flex-wrap items-start justify-between gap-3"><div><p className="text-xs font-semibold text-[#60708a]">{item.reference}</p><h3 className="mt-1 text-base font-semibold text-[#001030]">{item.requesterName || "Customer"} <span className="font-normal text-[#53627a]">· {item.requesterEmail}</span></h3></div><Badge variant="outline" className="border-[#a9c9ef] bg-[#f0f6fd] text-[#244f88]">{item.status}</Badge></div><div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4"><Info icon={MapPin} label="Pickup" value={item.pickupAddress} /><Info icon={MapPin} label={item.durationHours ? "Requested duration" : "Destination"} value={item.durationHours ? `${item.durationHours} hours` : item.destinationAddress || "To be coordinated"} /><Info icon={CalendarDays} label="Pickup time" value={new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short", timeZone: item.scheduledTimeZone }).format(new Date(item.scheduledAt))} /><Info icon={MapPin} label="Passenger" value={`${item.passengerName || "Not supplied"}${item.passengerEmail ? ` · ${item.passengerEmail}` : ""}`} /></div><p className="mt-4 border-t border-[#e5ebf3] pt-3 text-xs text-[#60708a]">{item.passengerCount} passenger(s) · {item.serviceTypeCode} · preferred category {item.vehicleClassCode}</p></article>)}</div>}
  </section>;
}

function Info({ icon: Icon, label, value }: { icon: typeof MapPin; label: string; value: string }) { return <div className="flex min-w-0 gap-2.5"><Icon className="mt-0.5 size-4 shrink-0 text-[#3270bf]" aria-hidden="true" /><div className="min-w-0"><p className="text-xs font-semibold text-[#60708a]">{label}</p><p className="mt-1 break-words text-sm text-[#001030]">{value}</p></div></div>; }
