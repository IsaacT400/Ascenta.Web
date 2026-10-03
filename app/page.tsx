/* eslint-disable @next/next/no-img-element -- Licensed remote prototype photography is intentionally replaceable. */
import Link from "next/link";
import {
  ArrowRight,
  BriefcaseBusiness,
  Building2,
  Check,
  Clock3,
  Globe2,
  MapPinned,
  Plane,
  Sparkles,
  UserRoundCheck,
} from "lucide-react";

import { BookingPanel } from "@/components/booking-panel";
import { CountMetric } from "@/components/count-metric";
import { FleetShowcase, JourneyFlow, PrototypeImageNote } from "@/components/home-experience";
import { HomeScrollMotion } from "@/components/home-scroll-motion";
import { Reveal } from "@/components/reveal";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";

const prototypeMode = process.env.NEXT_PUBLIC_PROTOTYPE_MODE !== "false";

// PLACEHOLDER — availability and operating rules remain to be confirmed.
const services = [
  { number: "01", title: "Airport transfers", description: "A composed arrival shaped around flight context, baggage, and pickup details.", icon: Plane },
  { number: "02", title: "Hourly chauffeur", description: "A dedicated vehicle for meetings, roadshows, events, and changing schedules.", icon: Clock3 },
  { number: "03", title: "City-to-city", description: "Private long-distance travel with space to work, prepare, or simply pause.", icon: MapPinned },
  { number: "04", title: "Corporate transportation", description: "One refined experience for travelers, bookers, departments, and reporting.", icon: Building2 },
  { number: "05", title: "Private aviation", description: "Detail-led ground transportation for FBO arrivals and tailored movements.", icon: BriefcaseBusiness },
];

const hospitality = [
  { number: "01", title: "Professional presence", text: "Composed, discreet, and attentive from the first greeting.", icon: UserRoundCheck },
  { number: "02", title: "Arrival intelligence", text: "Flight and pickup context appears precisely where it matters.", icon: Plane },
  { number: "03", title: "Considered cabin", text: "Space, preferences, and quiet prepared around the passenger.", icon: Sparkles },
  { number: "04", title: "Coordinated movement", text: "Complex itineraries become one clear, connected experience.", icon: Globe2 },
];

export default function Home() {
  return (
    <main className="min-h-screen overflow-x-clip bg-background text-foreground">
      <HomeScrollMotion />
      <SiteHeader />

      <section className="home-hero relative isolate min-h-[calc(100svh-76px)] overflow-hidden bg-[#355b6d] text-white">
        <img
          src="https://images.pexels.com/photos/3954388/pexels-photo-3954388.jpeg?auto=compress&cs=tinysrgb&w=2200"
          srcSet="https://images.pexels.com/photos/3954388/pexels-photo-3954388.jpeg?auto=compress&cs=tinysrgb&w=900 900w, https://images.pexels.com/photos/3954388/pexels-photo-3954388.jpeg?auto=compress&cs=tinysrgb&w=1600 1600w, https://images.pexels.com/photos/3954388/pexels-photo-3954388.jpeg?auto=compress&cs=tinysrgb&w=2200 2200w"
          sizes="100vw"
          fetchPriority="high"
          alt="Representative black executive vehicle in a modern city setting"
          className="home-hero-image absolute inset-0 -z-20 h-full w-full object-cover object-[62%_center]"
        />
        <div className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,rgba(7,26,36,.88)_0%,rgba(13,42,56,.72)_38%,rgba(53,91,109,.28)_72%,rgba(7,26,36,.12)_100%)]" />
        <div className="absolute inset-x-0 bottom-0 -z-10 h-64 bg-gradient-to-t from-[#071a24]/88 to-transparent" />
        <div className="absolute inset-0 -z-10 bg-[linear-gradient(180deg,rgba(255,255,255,.08),transparent_30%,transparent_72%,rgba(7,26,36,.28))]" />

        <div className="mx-auto grid min-h-[calc(100svh-76px)] w-full max-w-[1440px] items-center gap-12 px-5 py-12 sm:px-8 lg:grid-cols-[minmax(0,1fr)_minmax(480px,560px)] lg:px-12 lg:py-16 xl:px-16">
          <div className="home-hero-copy min-w-0 max-w-2xl self-center pt-4 lg:pb-24">
            <p className="hero-copy eyebrow text-[#d6e3e7]">Ascenta · Private Chauffeur Service</p>
            <h1 className="mt-6 max-w-2xl font-display text-[clamp(3.25rem,6.2vw,6.9rem)] leading-[.88] font-medium tracking-[-0.058em] text-balance" aria-label="Elevate the way you arrive.">
              <span className="hero-title-line"><span>Elevate the way</span></span>
              <span className="hero-title-line hero-title-line-second"><span>you arrive.</span></span>
            </h1>
            <p className="hero-copy mt-7 max-w-lg text-[1.08rem] leading-8 text-white/82 sm:text-xl">Ascenta turns every transfer into considered time—calm, precise, and ready for what comes next.</p>
            <div className="hero-copy mt-8 flex flex-wrap gap-x-6 gap-y-3 text-sm text-white/74">
              {["Professional chauffeurs", "Thoughtful trip planning", "Private, attentive service"].map((item) => (
                <span key={item} className="inline-flex items-center gap-2"><Check className="size-4 text-[#b4c9d1]" aria-hidden="true" />{item}</span>
              ))}
            </div>
          </div>
          <div className="home-hero-panel min-w-0 self-center"><div className="hero-panel lg:translate-y-1"><BookingPanel compact /></div></div>
        </div>

        <div className="hero-scroll-signature pointer-events-none absolute inset-x-0 bottom-0 hidden overflow-hidden border-t border-white/16 bg-[#071a24]/26 py-4 backdrop-blur-sm lg:block" aria-hidden="true">
          <div className="hero-scroll-signature-track flex w-max items-center gap-12 whitespace-nowrap text-[11px] font-bold tracking-[.22em] text-white/62 uppercase">
            <span>Ascenta · The journey, elevated</span><span className="size-1.5 rounded-full bg-[#b4c9d1]" /><span>Arrive composed</span><span className="size-1.5 rounded-full bg-[#b4c9d1]" /><span>Move with intention</span><span className="size-1.5 rounded-full bg-[#b4c9d1]" /><span>Ascenta · The journey, elevated</span>
          </div>
        </div>
      </section>

      <section id="services" className="relative bg-[#0d2a38] px-5 py-20 text-white sm:px-8 lg:px-12 lg:py-28 xl:px-16" aria-labelledby="services-title">
        <div className="mx-auto max-w-[1312px]">
          <div className="grid gap-8 lg:grid-cols-[.85fr_1.15fr] lg:items-end">
            <div>
              <Reveal variant="mask"><p className="eyebrow reveal-line text-[#b4c9d1]">One standard, every journey</p></Reveal>
              <Reveal variant="mask" delay={80}><h2 id="services-title" className="reveal-line mt-4 max-w-xl font-display text-4xl leading-[1.04] tracking-[-.04em] sm:text-6xl">Movement shaped around your day.</h2></Reveal>
            </div>
            <Reveal variant="right" delay={130}><p className="max-w-2xl text-base leading-8 text-white/62 lg:justify-self-end">From a single airport pickup to a complete executive itinerary, Ascenta adapts the service around the rhythm of the journey.</p></Reveal>
          </div>

          <div className="scrollbar-none mt-14 grid snap-x snap-mandatory auto-cols-[86%] grid-flow-col overflow-x-auto border-y border-white/14 sm:auto-cols-[46%] lg:auto-cols-[31%]">
              {services.map(({ number, title, description, icon: Icon }, index) => (
                <Reveal key={title} delay={100 + index * 90} className="snap-start border-r border-white/14 last:border-r-0">
                  <Link href="/services" className="group flex min-h-[330px] h-full flex-col px-6 py-8 transition-[background-color,transform] duration-500 hover:-translate-y-1 hover:bg-white/[.045] sm:px-8">
                  <div className="flex items-center justify-between"><span className="font-display text-3xl text-[#6f93a3]">{number}</span><Icon className="size-5 text-[#b4c9d1]" strokeWidth={1.4} /></div>
                  <div className="mt-auto"><h3 className="font-display text-3xl tracking-[-.03em]">{title}</h3><p className="mt-4 max-w-sm text-sm leading-6 text-white/55">{description}</p><span className="mt-7 inline-flex items-center gap-2 text-sm font-semibold text-white">Explore <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-1" /></span></div>
                  </Link>
                </Reveal>
              ))}
          </div>
          <Reveal delay={260}>
            <div className="mt-5 flex items-center justify-between text-xs font-semibold tracking-[.08em] text-white/42 uppercase"><span>Swipe or scroll to explore</span>{prototypeMode && <span>Provisional services</span>}</div>
          </Reveal>
        </div>
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 translate-y-full bg-gradient-to-b from-[#0d2a38] to-[#eef2f1]" />
      </section>

      <div className="h-24 bg-[#eef2f1]" aria-hidden="true" />
      <JourneyFlow />

      <section id="about" className="bg-[#b4c9d1] px-5 py-20 sm:px-8 lg:px-12 lg:py-28 xl:px-16" aria-labelledby="hospitality-title">
        <div className="mx-auto max-w-[1312px]">
          <div className="grid gap-8 lg:grid-cols-[1.05fr_.95fr] lg:items-end">
            <div>
              <Reveal variant="mask"><p className="eyebrow reveal-line text-[#355b6d]">Executive hospitality</p></Reveal>
              <Reveal variant="mask" delay={70}><h2 id="hospitality-title" className="reveal-line mt-4 max-w-2xl font-display text-5xl leading-[.98] tracking-[-.05em] text-[#071a24] sm:text-7xl">The details create the calm.</h2></Reveal>
            </div>
            <Reveal variant="right" delay={120}><p className="max-w-xl text-base leading-8 text-[#35515e] lg:justify-self-end">A service philosophy expressed through presence, context, cabin experience, and coordinated movement.</p></Reveal>
          </div>

          <div className="scrollbar-none mt-16 grid snap-x snap-mandatory auto-cols-[86%] grid-flow-col overflow-x-auto border-y border-[#6f93a3]/55 sm:auto-cols-[47%] lg:auto-cols-[25%]">
              {hospitality.map(({ number, title, text, icon: Icon }, index) => (
                <Reveal key={title} delay={100 + index * 95} className="snap-start border-r border-[#6f93a3]/55 last:border-r-0">
                  <article className="group min-h-[330px] py-8 pr-8 pl-6 transition-transform duration-500 hover:-translate-y-1 lg:pl-8">
                  <div className="flex items-center justify-between text-[#355b6d]"><span className="font-display text-3xl">{number}</span><Icon className="size-5 transition-transform duration-500 group-hover:-translate-y-1" strokeWidth={1.4} /></div>
                  <div className="mt-24"><h3 className="font-display text-3xl leading-tight tracking-[-.03em] text-[#071a24]">{title}</h3><p className="mt-4 text-base leading-7 text-[#35515e]">{text}</p></div>
                  </article>
                </Reveal>
              ))}
          </div>
        </div>
      </section>

      <section id="fleet" className="bg-[#f5f3ee] px-5 py-20 sm:px-8 lg:px-12 lg:py-28 xl:px-16" aria-labelledby="fleet-title">
        <div className="mx-auto max-w-[1312px]">
          <div className="grid gap-8 lg:grid-cols-[.85fr_1.15fr] lg:items-end">
            <div>
              <Reveal variant="mask"><p className="eyebrow reveal-line text-[#526f7d]">Representative fleet</p></Reveal>
              <Reveal variant="mask" delay={70}><h2 id="fleet-title" className="reveal-line mt-4 max-w-xl font-display text-4xl leading-[1.04] tracking-[-.045em] sm:text-6xl">Space selected around the journey.</h2></Reveal>
            </div>
            <Reveal variant="right" delay={120}><div className="max-w-xl lg:justify-self-end"><p className="text-base leading-8 text-[#60727a]">A flexible category system can match passenger count, luggage, itinerary, and service needs without disrupting the booking flow.</p><Link href="/fleet" className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-[#0d2a38]">Explore fleet concepts <ArrowRight className="size-4" /></Link></div></Reveal>
          </div>
          <Reveal variant="media" delay={120}><div className="reveal-media-inner"><FleetShowcase /></div></Reveal>
        </div>
      </section>

      <section id="business" className="relative overflow-hidden bg-[#355b6d] px-5 py-20 text-white sm:px-8 lg:px-12 lg:py-32 xl:px-16" aria-labelledby="business-title">
        <div className="absolute inset-y-0 right-0 w-1/2 bg-[radial-gradient(circle_at_70%_30%,rgba(180,201,209,.2),transparent_55%)]" />
        <div className="relative mx-auto grid max-w-[1312px] gap-14 lg:grid-cols-[1.1fr_.9fr] lg:items-end">
          <div>
            <Reveal variant="mask"><p className="eyebrow reveal-line text-[#dbe7ea]">Ascenta for business</p></Reveal>
            <Reveal variant="mask" delay={70}><h2 id="business-title" className="reveal-line mt-5 max-w-3xl font-display text-5xl leading-[.98] tracking-[-.05em] sm:text-7xl">Transportation visibility without added friction.</h2></Reveal>
            <Reveal delay={130}><p className="mt-7 max-w-xl text-base leading-8 text-white/68">A corporate experience for travelers, bookers, departments, references, invoices, and a precise view of account usage.</p><div className="mt-9 flex flex-wrap gap-3"><Button asChild className="h-11 rounded-full bg-white px-6 text-[#0d2a38] hover:bg-[#eef2f1]"><Link href="/corporate">View corporate demo <ArrowRight /></Link></Button><Button asChild variant="outline" className="h-11 rounded-full border-white/28 bg-transparent px-6 text-white hover:bg-white/10"><Link href="/corporate/usage">Open Usage Matrix</Link></Button></div></Reveal>
          </div>

          <Reveal delay={180} className="border-t border-white/22 lg:border-t-0 lg:border-l lg:pl-12">
            <div className="grid grid-cols-2 gap-x-7 gap-y-10">
              <div><p className="text-xs font-bold tracking-[.12em] text-white/48 uppercase">Program visibility</p><p className="mt-3 font-display text-5xl"><CountMetric value={38} label="rides" /></p><p className="mt-2 text-sm text-white/48">Rides this month</p></div>
              <div><p className="text-xs font-bold tracking-[.12em] text-white/48 uppercase">Traveler network</p><p className="mt-3 font-display text-5xl"><CountMetric value={12} label="travelers" /></p><p className="mt-2 text-sm text-white/48">Active travelers</p></div>
              <div className="col-span-2 border-t border-white/18 pt-7"><p className="text-xs font-bold tracking-[.12em] text-white/48 uppercase">Program utilization</p><div className="mt-4 flex items-end justify-between gap-5"><p className="font-display text-6xl"><CountMetric value={76} suffix="%" label="utilization" /></p><div className="mb-3 h-1.5 flex-1 overflow-hidden rounded-full bg-white/14"><span className="block h-full w-[76%] rounded-full bg-[#b4c9d1]" /></div></div></div>
            </div>
            {prototypeMode && <p className="mt-10 text-xs font-semibold tracking-[.08em] text-white/40 uppercase">Demo account data</p>}
          </Reveal>
        </div>
      </section>

      <section className="relative overflow-hidden bg-[#071a24] px-5 py-24 text-white sm:px-8 lg:px-12 lg:py-32 xl:px-16">
        <div className="absolute inset-0 bg-[linear-gradient(115deg,transparent_0%,rgba(111,147,163,.12)_58%,rgba(180,201,209,.16)_100%)]" />
        <div className="relative mx-auto flex max-w-[1312px] flex-col items-start justify-between gap-10 lg:flex-row lg:items-end">
          <div>
            <Reveal variant="mask"><p className="eyebrow reveal-line text-[#b4c9d1]">Your next journey</p></Reveal>
            <Reveal variant="mask" delay={70}><h2 className="reveal-line mt-5 max-w-4xl font-display text-5xl leading-[.98] tracking-[-.05em] sm:text-7xl">Begin with where you need to be.</h2></Reveal>
          </div>
          <Reveal delay={130} className="shrink-0"><Button asChild className="h-13 rounded-full bg-white px-8 text-base text-[#071a24] hover:bg-[#dde7ea]"><Link href="/booking">Plan your ride <ArrowRight /></Link></Button></Reveal>
        </div>
        <div className="relative mx-auto mt-16 max-w-[1312px] border-t border-white/12 pt-6"><PrototypeImageNote /></div>
      </section>

      <SiteFooter />
    </main>
  );
}
