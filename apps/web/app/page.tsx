/* eslint-disable @next/next/no-img-element -- The current photography is a temporary design reference and will be replaced after licensing review. */
import Link from "next/link";
import { ArrowDown, ArrowRight, BriefcaseBusiness, Check, Clock3, Plane, ShieldCheck } from "lucide-react";

import { BookingPanel } from "@/components/booking-panel";
import { HomeScrollMotion } from "@/components/home-scroll-motion";
import { Reveal } from "@/components/reveal";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";

const requestTypes = [
  { code: "AIRPORT_TRANSFER", title: "Airport travel", copy: "Share pickup and destination details for an airport journey.", icon: Plane },
  { code: "HOURLY", title: "By the hour", copy: "Describe the time and itinerary you would like the team to review.", icon: Clock3 },
  { code: "CITY_TO_CITY", title: "City to city", copy: "Send the places and timing for a point-to-point request.", icon: BriefcaseBusiness },
] as const;

export default function Home() {
  return <main className="min-h-screen w-full overflow-x-clip bg-white text-[#001030]">
    <HomeScrollMotion />
    <SiteHeader />

    <section className="home-hero relative isolate flex min-h-[calc(100svh-76px)] flex-col justify-center overflow-hidden bg-[#001030] px-4 pb-9 pt-12 text-center text-white sm:px-8 lg:px-12 lg:pt-14">
      <img src="https://images.pexels.com/photos/3954388/pexels-photo-3954388.jpeg?auto=compress&cs=tinysrgb&w=2200" srcSet="https://images.pexels.com/photos/3954388/pexels-photo-3954388.jpeg?auto=compress&cs=tinysrgb&w=900 900w, https://images.pexels.com/photos/3954388/pexels-photo-3954388.jpeg?auto=compress&cs=tinysrgb&w=1600 1600w, https://images.pexels.com/photos/3954388/pexels-photo-3954388.jpeg?auto=compress&cs=tinysrgb&w=2200 2200w" sizes="100vw" fetchPriority="high" alt="" aria-hidden="true" className="home-hero-image absolute inset-0 -z-20 h-full w-full object-cover object-[60%_center]" />
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(180deg,rgba(0,16,48,.62)_0%,rgba(0,16,48,.42)_35%,rgba(0,16,48,.84)_100%)]" />
      <div className="relative mx-auto w-[calc(100vw-2rem)] min-w-0 max-w-[1180px] sm:w-full">
        <p className="hero-copy eyebrow text-white/85">Executive Transportation</p>
        <h1 className="mx-auto mt-5 max-w-[1180px] break-words font-display text-[clamp(2.25rem,7.2vw,6.4rem)] leading-[.98] tracking-[-.055em] text-balance sm:text-[clamp(3.5rem,7.2vw,6.4rem)]">Certainty from<br className="sm:hidden" /> reservation<br className="hidden sm:block" /><br className="sm:hidden" /> <span className="italic text-[#c6defc]">to arrival.</span></h1>
        <p className="hero-copy mx-auto mt-5 max-w-[calc(100vw-2rem)] text-base leading-7 text-white/85 sm:max-w-2xl sm:text-lg">Share the details of your journey. The ASCENTA team will review your request and follow up with next steps.</p>
        <div id="journey" className="hero-panel mx-auto mt-8 max-w-[1040px] text-left"><BookingPanel compact /></div>
        <a href="#experience" className="hero-copy mt-5 inline-flex min-h-10 items-center gap-2 text-sm font-medium text-white/75 hover:text-white">Explore ASCENTA <ArrowDown className="size-4" /></a>
      </div>
      <p className="absolute bottom-2 right-4 text-[10px] text-white/60">Temporary photography · replacement and rights review pending</p>
    </section>

    <section id="experience" data-nav-theme="light" className="bg-[#c6defc] px-5 py-20 sm:px-8 lg:px-12 lg:py-28" aria-labelledby="experience-title">
      <div className="mx-auto grid max-w-[1240px] gap-10 lg:grid-cols-[.85fr_1.15fr] lg:items-center">
        <div><Reveal variant="mask"><p className="eyebrow reveal-line text-[#31568c]">A considered journey</p></Reveal><Reveal variant="mask" delay={80}><h2 id="experience-title" className="reveal-line mt-4 max-w-lg font-display text-5xl leading-[1.02] tracking-[-.045em] sm:text-7xl">Elevating every journey.</h2></Reveal></div>
        <Reveal variant="right" delay={140}><div className="max-w-2xl lg:justify-self-end"><p className="text-lg leading-8 text-[#243d62]">Clear details help the team understand what you need, who is travelling, and how to reach you.</p><div className="mt-7 flex items-start gap-3 border-t border-[#001030]/20 pt-5"><ShieldCheck className="mt-0.5 size-5 shrink-0 text-[#3270bf]" /><p className="text-sm leading-6 text-[#243d62]">A request is received for review. It does not confirm a vehicle, availability, or price.</p></div></div></Reveal>
      </div>
    </section>

    <section id="services" data-nav-theme="light" className="bg-white px-5 py-20 sm:px-8 lg:px-12 lg:py-28" aria-labelledby="services-title">
      <div className="mx-auto max-w-[1240px]"><div className="flex flex-wrap items-end justify-between gap-6"><div><p className="eyebrow text-[#3270bf]">Journey requests</p><h2 id="services-title" className="mt-3 max-w-2xl font-display text-4xl leading-tight tracking-[-.04em] sm:text-6xl">Start with the journey you have in mind.</h2></div><p className="max-w-md text-sm leading-6 text-[#53627a]">These request types are available in the local catalog. The team reviews each itinerary individually.</p></div>
        <div className="mt-10 grid gap-4 md:grid-cols-3">{requestTypes.map(({ code, title, copy, icon: Icon }, index) => <Reveal key={code} delay={index * 90}><article className="flex h-full min-h-64 flex-col rounded-xl border border-[#d5dfec] bg-[#f7f9fd] p-6 sm:p-7"><span className="grid size-11 place-items-center rounded-full bg-[#e4effd] text-[#3270bf]"><Icon className="size-5" /></span><h3 className="mt-7 font-display text-2xl text-[#001030]">{title}</h3><p className="mt-3 flex-1 text-sm leading-6 text-[#53627a]">{copy}</p><Button asChild variant="link" className="mt-5 h-auto justify-start p-0 text-[#245b9f]"><Link href={`/booking?service=${code}`}>Prepare a request <ArrowRight className="size-4" /></Link></Button></article></Reveal>)}</div>
      </div>
    </section>

    <section id="business" data-nav-theme="dark" className="bg-[#001030] px-5 py-20 text-white sm:px-8 lg:px-12 lg:py-28" aria-labelledby="business-title">
      <div className="mx-auto grid max-w-[1240px] gap-10 lg:grid-cols-[1fr_.8fr] lg:items-center"><div><p className="eyebrow text-[#92bef2]">For organizations</p><h2 id="business-title" className="mt-4 max-w-2xl font-display text-4xl leading-tight tracking-[-.04em] sm:text-6xl">A clear path for business travel requests.</h2><p className="mt-5 max-w-xl text-base leading-7 text-white/75">Team members with an ASCENTA corporate account can review requests available to their organization.</p><Button asChild className="mt-7 h-12 rounded-lg bg-[#3270bf] px-6 text-white hover:bg-[#245b9f]"><Link href="/business">Explore business travel <ArrowRight /></Link></Button></div>
        <Reveal variant="right" className="rounded-xl border border-white/20 bg-white/[.06] p-6 sm:p-8"><p className="eyebrow text-[#92bef2]">Request details</p><ul className="mt-5 space-y-4 text-sm text-white/85">{["Journey and local pickup time", "Passenger and requester details", "A reference that follows the request"].map((item) => <li key={item} className="flex items-start gap-3"><Check className="mt-0.5 size-4 shrink-0 text-[#92bef2]" />{item}</li>)}</ul><Link href="/corporate" className="mt-7 inline-flex min-h-11 items-center gap-2 font-semibold text-white hover:text-[#c6defc]">Sign in to the corporate portal <ArrowRight className="size-4" /></Link></Reveal>
      </div>
    </section>

    <section className="bg-[#f7f9fd] px-5 py-16 sm:px-8 lg:px-12 lg:py-20" aria-label="Request information"><div className="mx-auto grid max-w-[1240px] gap-8 md:grid-cols-2"><div><p className="eyebrow text-[#3270bf]">Before you send</p><h2 className="mt-3 font-display text-3xl">What happens next?</h2><p className="mt-3 max-w-lg text-sm leading-6 text-[#53627a]">Your request is saved to your account and made available to authorized operations staff for review.</p></div><div className="space-y-5"><div><h3 className="font-semibold">Is this an instant booking?</h3><p className="mt-1 text-sm leading-6 text-[#53627a]">No. Sending a request does not reserve a vehicle or confirm availability.</p></div><div><h3 className="font-semibold">Will I see a price?</h3><p className="mt-1 text-sm leading-6 text-[#53627a]">No price is calculated in this experience. Any quote requires a separate review.</p></div></div></div></section>
    <SiteFooter />
  </main>;
}
