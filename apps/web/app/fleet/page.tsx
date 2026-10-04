/* eslint-disable @next/next/no-img-element -- Remote prototype photography is intentionally replaceable. */
import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Check, Luggage, ShieldCheck, Users } from "lucide-react";

import { PageHero } from "@/components/page-hero";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = { title: "Fleet", description: "Representative Ascenta Executive vehicle categories." };

// PLACEHOLDER — categories, capacities, amenities, and imagery are not a confirmed fleet.
const fleet = [
  { name: "Executive SUV", image: "https://images.pexels.com/photos/3954388/pexels-photo-3954388.jpeg?auto=compress&cs=tinysrgb&w=1600", credit: "Pexels · Jae Park", passengers: "Up to 3", luggage: "3 bags", use: "Executives, airport travel, discreet point-to-point", amenities: ["Quiet cabin", "Device charging", "Bottled water"] },
  { name: "Premium SUV", image: "https://images.pexels.com/photos/29566876/pexels-photo-29566876/free-photo-of-luxury-black-suv-with-elegant-reflections.jpeg?auto=compress&cs=tinysrgb&w=1600", credit: "Pexels · Luke Miller", passengers: "Up to 5", luggage: "5 bags", use: "Families, extra luggage, small groups", amenities: ["Expanded space", "Climate comfort", "Flexible luggage"] },
  { name: "Executive Van / Sprinter", image: "https://images.pexels.com/photos/19871522/pexels-photo-19871522/free-photo-of-a-black-2023-mercedes-benz-sprinter-cargo-van.jpeg?auto=compress&cs=tinysrgb&w=1600", credit: "Pexels · Eduardo Valdes", passengers: "Up to 10", luggage: "10 bags", use: "Corporate groups, events, coordinated movements", amenities: ["Group seating", "Generous luggage", "Event-ready"] },
];

export default function FleetPage() {
  return (
    <main className="min-h-screen bg-[#f8f8f5]">
      <SiteHeader />
      <PageHero eyebrow="Representative fleet" title="The right space for every journey." description="These categories and images demonstrate presentation only. Actual vehicles, capacities, amenities, and substitutions must be confirmed by Ascenta." action={<Button asChild className="h-11 rounded-full bg-white px-6 text-[#0b1a24] hover:bg-[#ebe7dd]"><Link href="/booking">Choose in booking <ArrowRight /></Link></Button>} />
      <section className="px-5 py-16 sm:px-8 lg:px-12 lg:py-24 xl:px-16">
        <div className="mx-auto max-w-[1312px] space-y-8">
          {fleet.map((vehicle, index) => (
            <article key={vehicle.name} className="grid overflow-hidden rounded-[1.5rem] border border-[#dce1e3] bg-white lg:grid-cols-2">
              <div className={`relative min-h-[320px] lg:min-h-[460px] ${index % 2 ? "lg:order-2" : ""}`}><img src={vehicle.image} alt={`Representative image for ${vehicle.name}`} className="absolute inset-0 h-full w-full object-cover" /><div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent" /><p className="absolute bottom-4 left-5 text-[10px] font-semibold tracking-[.1em] text-white/65 uppercase">Temporary image · {vehicle.credit}</p></div>
              <div className="flex flex-col p-7 sm:p-10 lg:p-12">
                <div className="flex items-start justify-between gap-4"><div><p className="eyebrow text-[#8d7040]">Category 0{index + 1}</p><h2 className="mt-3 font-display text-4xl tracking-[-.04em]">{vehicle.name}</h2></div><Badge variant="outline" className="border-[#ddcfb1] bg-[#faf7ef] text-[#7b6339]">To be confirmed</Badge></div>
                <p className="mt-7 text-base leading-7 text-[#67747a]">Recommended for {vehicle.use.toLowerCase()}.</p>
                <div className="mt-7 grid grid-cols-2 gap-4"><div className="rounded-xl bg-[#f2f4f3] p-4"><Users className="size-5 text-[#8f7340]" /><p className="mt-3 text-xs text-[#788287]">Passengers</p><p className="mt-1 font-semibold">{vehicle.passengers}</p></div><div className="rounded-xl bg-[#f2f4f3] p-4"><Luggage className="size-5 text-[#8f7340]" /><p className="mt-3 text-xs text-[#788287]">Luggage</p><p className="mt-1 font-semibold">{vehicle.luggage}</p></div></div>
                <ul className="mt-7 space-y-3">{vehicle.amenities.map((item) => <li key={item} className="flex items-center gap-3 text-sm text-[#4e5d64]"><span className="grid size-5 place-items-center rounded-full bg-[#eef1ea] text-[#526c51]"><Check className="size-3" /></span>{item}</li>)}</ul>
                <div className="mt-auto pt-9"><Button asChild className="h-11 rounded-full bg-[#0b1a24] px-6 text-white"><Link href="/booking">Select this category <ArrowRight /></Link></Button></div>
              </div>
            </article>
          ))}
          <div className="flex gap-3 rounded-2xl border border-[#d9dfe1] bg-[#eef1f1] p-5 text-sm leading-6 text-[#56666e]"><ShieldCheck className="mt-0.5 size-5 shrink-0 text-[#80683d]" /><p>Vehicle examples do not represent a confirmed Ascenta fleet. Production listings will be managed as categories and inventory records, not hard-coded into marketing pages.</p></div>
        </div>
      </section>
      <SiteFooter />
    </main>
  );
}
