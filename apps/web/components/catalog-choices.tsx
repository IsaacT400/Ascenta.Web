"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight, CarFront, CircleHelp } from "lucide-react";

import { Button } from "@/components/ui/button";
import { getCatalog } from "@/lib/api-client";
import type { CatalogItem } from "@ascenta/shared";

const serviceLabels: Record<string, string> = {
  ONE_WAY: "One way",
  AIRPORT_TRANSFER: "Airport transfer",
  HOURLY: "By the hour",
  ROUND_TRIP: "Round trip",
  CITY_TO_CITY: "City to city",
};

export function CatalogChoices({ type }: { type: "service" | "vehicle" }) {
  const [items, setItems] = useState<CatalogItem[] | null>(null);
  const [error, setError] = useState(false);
  useEffect(() => {
    void getCatalog().then((catalog) => setItems(type === "service" ? catalog.serviceTypes : catalog.vehicleClasses)).catch(() => setError(true));
  }, [type]);
  const retry = () => { setError(false); setItems(null); void getCatalog().then((catalog) => setItems(type === "service" ? catalog.serviceTypes : catalog.vehicleClasses)).catch(() => setError(true)); };

  return <section className="px-5 py-16 sm:px-8 lg:px-12 lg:py-20"><div className="mx-auto max-w-6xl">
    {error && <div role="alert" className="rounded-xl border border-red-200 bg-white p-6 text-sm text-red-800">The active catalog could not be loaded. <button type="button" className="font-semibold underline" onClick={retry}>Retry</button></div>}
    {!items && !error && <p className="rounded-xl border border-[#d5dfec] bg-white p-6 text-sm text-[#53627a]" aria-live="polite">Loading active catalog…</p>}
    {items?.length === 0 && <div className="rounded-xl border border-[#d5dfec] bg-white p-6"><p className="font-semibold">No active {type === "service" ? "journey types" : "vehicle categories"} are listed.</p><p className="mt-2 text-sm text-[#53627a]">Please check again later.</p></div>}
    {!!items?.length && <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{items.map((item) => <article key={item.code} className="flex min-h-56 flex-col rounded-xl border border-[#d5dfec] bg-white p-6"><span className="grid size-10 place-items-center rounded-full bg-[#e4effd] text-[#3270bf]">{type === "service" ? <CircleHelp className="size-5" /> : <CarFront className="size-5" />}</span><h2 className="mt-5 font-display text-2xl text-[#001030]">{type === "service" ? serviceLabels[item.code] ?? item.name : item.name}</h2><p className="mt-2 flex-1 text-sm leading-6 text-[#53627a]">{type === "service" ? "Submit journey details for individual review. The request does not confirm availability or price." : "A category preference only. The catalog listing does not confirm a vehicle for your date."}</p><Button asChild variant="link" className="mt-4 h-11 justify-start p-0 text-[#245b9f]"><Link href={type === "service" ? `/booking?service=${encodeURIComponent(item.code)}` : `/booking?vehicle=${encodeURIComponent(item.code)}`}>Prepare a request <ArrowRight className="size-4" /></Link></Button></article>)}</div>}
    <p className="mt-6 text-xs leading-5 text-[#53627a]">Catalog entries are for request preparation. Availability, rates, and operating rules are not calculated here.</p>
  </div></section>;
}
