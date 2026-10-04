import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, BriefcaseBusiness, Building2, CalendarRange, Clock3, MapPinned, Plane, UsersRound } from "lucide-react";

import { PageHero } from "@/components/page-hero";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = { title: "Services", description: "Explore Ascenta Executive chauffeur service concepts." };

// PLACEHOLDER — service availability and operating rules remain to be confirmed.
const services = [
  { title: "Airport transfer", description: "Arrival and departure planning designed around flight details, baggage, and pickup requirements.", icon: Plane, detail: "Commercial airports" },
  { title: "Point-to-point", description: "Direct private transportation between addresses, hotels, offices, and venues.", icon: MapPinned, detail: "Single journey" },
  { title: "Hourly chauffeur", description: "A dedicated vehicle for flexible schedules, meetings, roadshows, and evenings out.", icon: Clock3, detail: "Flexible itinerary" },
  { title: "City-to-city", description: "A private alternative for longer journeys with space to work, rest, or prepare.", icon: ArrowRight, detail: "Long-distance" },
  { title: "Corporate transportation", description: "Coordinated booking, references, traveler management, and reporting for business accounts.", icon: Building2, detail: "Teams and guests" },
  { title: "Private aviation / FBO", description: "Detail-oriented ground transportation for private terminals and tailored aviation movements.", icon: BriefcaseBusiness, detail: "FBO coordination" },
  { title: "Events and groups", description: "Planned transportation for multiple travelers, vehicles, timing points, and manifests.", icon: UsersRound, detail: "Coordinated movement" },
  { title: "Roadshows", description: "Schedule-led hourly transportation across a sequence of meetings and changing requirements.", icon: CalendarRange, detail: "Complex schedules" },
];

export default function ServicesPage() {
  return (
    <main className="min-h-screen bg-[#f8f8f5]">
      <SiteHeader />
      <PageHero eyebrow="Services" title="One standard. Every kind of journey." description="An adaptable chauffeur service framework for individual, executive, and coordinated transportation. All service definitions remain provisional for this prototype." action={<Button asChild className="h-11 rounded-full bg-white px-6 text-[#0b1a24] hover:bg-[#ebe7dd]"><Link href="/booking">Plan a ride <ArrowRight /></Link></Button>} />
      <section className="px-5 py-16 sm:px-8 lg:px-12 lg:py-24 xl:px-16">
        <div className="mx-auto max-w-[1312px]">
          <div className="grid gap-px overflow-hidden rounded-[1.5rem] border border-[#d9dfe1] bg-[#d9dfe1] sm:grid-cols-2 lg:grid-cols-4">
            {services.map(({ title, description, detail, icon: Icon }) => (
              <article key={title} className="group flex min-h-[310px] flex-col bg-white p-7 transition-colors hover:bg-[#f3f1eb]">
                <div className="flex items-center justify-between"><span className="grid size-11 place-items-center rounded-full bg-[#eef1f1] text-[#294554]"><Icon className="size-5" strokeWidth={1.5} /></span><span className="text-[10px] font-bold tracking-[.12em] text-[#9b7b43] uppercase">{detail}</span></div>
                <div className="mt-auto"><h2 className="font-display text-2xl tracking-[-.025em]">{title}</h2><p className="mt-3 text-sm leading-6 text-[#68747a]">{description}</p><Link href="/booking" className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-[#0b1a24]">Start planning <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" /></Link></div>
              </article>
            ))}
          </div>
          <div className="mt-8 rounded-2xl border border-[#ddd1b7] bg-[#faf7f0] p-5 text-sm leading-6 text-[#6e5d3d]">PLACEHOLDER: exact service availability, coverage, minimums, and booking rules must be confirmed before these descriptions become production content.</div>
        </div>
      </section>
      <SiteFooter />
    </main>
  );
}
