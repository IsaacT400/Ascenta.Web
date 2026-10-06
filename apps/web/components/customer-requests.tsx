"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight, CalendarDays, MapPin } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getReservations } from "@/lib/api-client";
import type { ReservationView } from "@ascenta/shared";

export function CustomerRequests({ corporate = false }: { corporate?: boolean }) {
  const [requests, setRequests] = useState<ReservationView[] | null>(null);
  const [failed, setFailed] = useState(false);
  useEffect(() => { void getReservations().then(setRequests).catch(() => setFailed(true)); }, []);

  if (failed) return <div role="alert" className="rounded-xl border border-red-200 bg-white p-6 text-sm text-red-800">Your requests could not be loaded. <button type="button" className="font-semibold underline" onClick={() => { setFailed(false); void getReservations().then(setRequests).catch(() => setFailed(true)); }}>Retry</button></div>;
  if (!requests) return <div className="rounded-xl border border-[#d5dfec] bg-white p-6 text-sm text-[#53627a]" aria-live="polite">Loading your requests…</div>;
  if (!requests.length) return <div className="rounded-2xl border border-[#d5dfec] bg-white p-8 sm:p-10"><p className="eyebrow text-[#3270bf]">Your account</p><h2 className="mt-3 font-display text-3xl text-[#001030]">Your journeys start here.</h2><p className="mt-3 max-w-xl text-sm leading-6 text-[#53627a]">Requests you send will appear here with their reference and current review status.</p><Button asChild className="mt-6 rounded-lg bg-[#3270bf] text-white"><Link href="/booking">Prepare a request <ArrowRight /></Link></Button></div>;

  return <section className="space-y-4" aria-labelledby="requests-title"><div><p className="eyebrow text-[#3270bf]">{corporate ? "Corporate portal" : "Customer portal"}</p><h2 id="requests-title" className="mt-2 font-display text-3xl text-[#001030]">{corporate ? "Organization requests" : "Your requests"}</h2><p className="mt-2 text-sm text-[#53627a]">A request remains under review until the operations team responds.</p></div>{requests.map((request) => <article key={request.id} className="rounded-xl border border-[#d5dfec] bg-white p-5 sm:p-6"><div className="flex flex-wrap items-start justify-between gap-3"><div><p className="text-xs font-semibold text-[#60708a]">Reference</p><h3 className="mt-1 font-display text-2xl text-[#001030]">{request.reference}</h3></div><Badge variant="outline" className="border-[#a9c9ef] bg-[#f0f6fd] text-[#244f88]">{request.status}</Badge></div><div className="mt-5 grid gap-4 sm:grid-cols-3"><Info icon={MapPin} label="Route" value={`${request.pickupAddress} → ${request.destinationAddress || (request.durationHours ? `${request.durationHours} hours` : "To be coordinated")}`} /><Info icon={CalendarDays} label="Requested pickup" value={new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short", timeZone: request.scheduledTimeZone }).format(new Date(request.scheduledAt))} /><Info icon={MapPin} label="Passenger" value={request.passengerName || "Account holder"} /></div><p className="mt-5 text-xs text-[#60708a]">Received {new Date(request.createdAt).toLocaleString()}</p></article>)}</section>;
}

function Info({ icon: Icon, label, value }: { icon: typeof MapPin; label: string; value: string }) { return <div className="flex min-w-0 gap-3"><Icon className="mt-0.5 size-4 shrink-0 text-[#3270bf]" aria-hidden="true" /><div className="min-w-0"><p className="text-xs font-semibold text-[#60708a]">{label}</p><p className="mt-1 break-words text-sm text-[#001030]">{value}</p></div></div>; }
