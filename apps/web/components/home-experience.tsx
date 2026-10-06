"use client";

/* eslint-disable @next/next/no-img-element -- Licensed remote prototype photography remains intentionally replaceable. */
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowRight, Check, Luggage, ShieldCheck, Users } from "lucide-react";

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel";
import { Reveal } from "@/components/reveal";

const prototypeMode = process.env.NEXT_PUBLIC_PROTOTYPE_MODE !== "false";

// PLACEHOLDER PHOTOGRAPHY — Pexels assets selected for local visual evaluation.
const journeySteps = [
  {
    number: "01",
    label: "Arrival",
    title: "The journey begins before the pickup.",
    text: "Arrival details, luggage context, and the meeting point are considered before the vehicle reaches the curb.",
    image: "https://images.pexels.com/photos/13252418/pexels-photo-13252418.jpeg?auto=compress&cs=tinysrgb&w=1800",
    alt: "Traveler with luggage moving through a large airport terminal",
    credit: "David Guerrero / Pexels",
  },
  {
    number: "02",
    label: "Chauffeur",
    title: "Presence without interruption.",
    text: "A professional welcome, attentive luggage assistance, and clear coordination create confidence at the handoff.",
    image: "https://images.pexels.com/photos/8425042/pexels-photo-8425042.jpeg?auto=compress&cs=tinysrgb&w=1800",
    alt: "Professional chauffeur opening a car door beneath an umbrella",
    credit: "Pavel Danilyuk / Pexels",
  },
  {
    number: "03",
    label: "Journey",
    title: "Time returns to the passenger.",
    text: "Inside the cabin, the environment becomes a private interval to prepare, work, or simply arrive composed.",
    image: "https://images.pexels.com/photos/8424985/pexels-photo-8424985.jpeg?auto=compress&cs=tinysrgb&w=1800",
    alt: "Executive passenger working quietly on a laptop inside a vehicle",
    credit: "Pavel Danilyuk / Pexels",
  },
  {
    number: "04",
    label: "Destination",
    title: "The last detail is a calm arrival.",
    text: "Timing, access, and the final approach are handled with the same precision as the first mile.",
    image: "https://images.pexels.com/photos/1755288/pexels-photo-1755288.jpeg?auto=compress&cs=tinysrgb&w=1800",
    alt: "Contemporary hotel entrance illuminated in the evening",
    credit: "Gustavo Rodrigues / Pexels",
  },
];

// PLACEHOLDER — categories, capacities, and imagery require operational confirmation.
const vehicles = [
  {
    name: "Executive SUV",
    kicker: "Discreet movement",
    image: "https://images.pexels.com/photos/3954388/pexels-photo-3954388.jpeg?auto=compress&cs=tinysrgb&w=1800",
    alt: "Representative black executive SUV in a city setting",
    seats: "Up to 3",
    luggage: "3 bags",
    use: "Executives, airport travel, and considered point-to-point service.",
  },
  {
    name: "Premium SUV",
    kicker: "Space without compromise",
    image: "https://images.pexels.com/photos/29566876/pexels-photo-29566876/free-photo-of-luxury-black-suv-with-elegant-reflections.jpeg?auto=compress&cs=tinysrgb&w=1800",
    alt: "Representative premium black SUV with architectural reflections",
    seats: "Up to 5",
    luggage: "5 bags",
    use: "Families, additional luggage, and small groups moving together.",
  },
  {
    name: "Executive Van",
    kicker: "Coordinated capacity",
    image: "https://images.pexels.com/photos/19871522/pexels-photo-19871522/free-photo-of-a-black-2023-mercedes-benz-sprinter-cargo-van.jpeg?auto=compress&cs=tinysrgb&w=1800",
    alt: "Representative black executive van",
    seats: "Up to 10",
    luggage: "10 bags",
    use: "Corporate groups, events, and multi-passenger movements.",
  },
];

export function JourneyFlow() {
  const [active, setActive] = useState(0);
  const storyRefs = useRef<(HTMLElement | null)[]>([]);

  useEffect(() => {
    if (!("IntersectionObserver" in window)) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (!visible) return;
        const index = Number((visible.target as HTMLElement).dataset.stepIndex);
        if (!Number.isNaN(index)) setActive(index);
      },
      { rootMargin: "-28% 0px -42% 0px", threshold: [0.2, 0.5, 0.75] },
    );
    storyRefs.current.forEach((node) => node && observer.observe(node));
    return () => observer.disconnect();
  }, []);

  return (
    <section id="journey" className="relative bg-[#f7f9fd] px-5 py-20 sm:px-8 lg:px-12 lg:py-32 xl:px-16" aria-labelledby="journey-flow-title">
      <div className="mx-auto max-w-[1312px]">
        <div className="grid gap-8 border-b border-[#c9d7dc] pb-12 lg:grid-cols-[.9fr_1.1fr] lg:items-end">
          <Reveal variant="left"><div>
            <p className="eyebrow text-[#526f7d]">The Ascenta journey</p>
            <h2 id="journey-flow-title" className="mt-4 max-w-xl font-display text-4xl leading-[1.04] tracking-[-.045em] text-[#001030] sm:text-6xl">Four moments. One continuous standard.</h2>
          </div></Reveal>
          <Reveal variant="right" delay={110}><p className="max-w-xl text-base leading-8 text-[#5f727b] lg:justify-self-end">A private journey is not one transaction. It is a sequence of details designed to feel calm from arrival to destination.</p></Reveal>
        </div>

        <div className="mt-12 hidden gap-12 lg:grid lg:grid-cols-[minmax(0,1.12fr)_minmax(360px,.88fr)]">
          <div className="sticky top-24 h-[calc(100vh-8rem)] min-h-[580px] max-h-[820px] overflow-hidden bg-[#001030]">
            {journeySteps.map((step, index) => (
              <figure key={step.label} className={`absolute inset-0 transition-[opacity,transform] duration-[1100ms] ease-[cubic-bezier(.22,1,.36,1)] ${active === index ? "scale-100 opacity-100" : "pointer-events-none scale-[1.035] opacity-0"}`} aria-hidden={active !== index}>
                <img src={step.image} srcSet={`${step.image}&w=900 900w, ${step.image}&w=1600 1600w`} sizes="(min-width: 1024px) 55vw, 100vw" loading="lazy" decoding="async" alt={step.alt} className="h-full w-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#001030]/72 via-transparent to-[#001030]/12" />
                {prototypeMode && <figcaption className="absolute bottom-5 left-6 text-xs font-semibold tracking-[.08em] text-white/62 uppercase">Temporary image · {step.credit}</figcaption>}
              </figure>
            ))}
            <div className="absolute top-7 right-7 flex items-center gap-4 text-sm font-semibold text-white">
              <span>{journeySteps[active].number}</span>
              <span className="h-px w-20 bg-white/28"><span className="block h-px bg-white transition-[width] duration-700" style={{ width: `${((active + 1) / journeySteps.length) * 100}%` }} /></span>
              <span className="text-white/42">04</span>
            </div>
          </div>

          <div>
            {journeySteps.map((step, index) => (
              <article
                key={step.label}
                ref={(node) => { storyRefs.current[index] = node; }}
                data-step-index={index}
                className={`flex min-h-[68vh] max-w-lg flex-col justify-center border-b border-[#c9d7dc] py-20 transition-[opacity,transform] duration-700 ease-[cubic-bezier(.22,1,.36,1)] last:border-0 ${active === index ? "translate-y-0 opacity-100" : "translate-y-5 opacity-[.34]"}`}
              >
                <div className="flex items-center gap-4"><span className="font-display text-4xl text-[#3270bf]">{step.number}</span><span className="eyebrow text-[#526f7d]">{step.label}</span></div>
                <h3 className="mt-8 font-display text-5xl leading-[1.05] tracking-[-.045em] text-[#001030]">{step.title}</h3>
                <p className="mt-6 text-lg leading-8 text-[#5f727b]">{step.text}</p>
              </article>
            ))}
          </div>
        </div>

        <div className="mt-10 space-y-16 lg:hidden">
          {journeySteps.map((step, index) => (
            <Reveal key={step.label} variant={index % 2 === 0 ? "left" : "right"} delay={70}>
            <article>
              <div className="relative aspect-[4/5] overflow-hidden bg-[#001030]">
                <img src={step.image} loading="lazy" decoding="async" alt={step.alt} className="h-full w-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#001030]/62 via-transparent to-transparent" />
                <span className="absolute bottom-5 left-5 font-display text-4xl text-white">{step.number}</span>
              </div>
              <p className="eyebrow mt-6 text-[#526f7d]">{step.label}</p>
              <h3 className="mt-3 font-display text-3xl leading-tight tracking-[-.035em]">{step.title}</h3>
              <p className="mt-4 text-base leading-7 text-[#5f727b]">{step.text}</p>
            </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

export function FleetShowcase() {
  const [api, setApi] = useState<CarouselApi>();
  const [active, setActive] = useState(0);

  useEffect(() => {
    if (!api) return;
    const update = () => setActive(api.selectedScrollSnap());
    update();
    api.on("select", update);
    api.on("reInit", update);
    return () => { api.off("select", update); api.off("reInit", update); };
  }, [api]);

  return (
    <Carousel setApi={setApi} opts={{ align: "start", loop: false, dragFree: false }} className="mt-12" aria-label="Representative fleet categories">
      <CarouselContent className="-ml-3">
        {vehicles.map((vehicle, index) => (
          <CarouselItem key={vehicle.name} className="basis-[92%] pl-3 lg:basis-[86%] xl:basis-[82%]">
            <article className="grid min-h-[570px] overflow-hidden bg-white lg:grid-cols-[1.35fr_.65fr]">
              <div className="group relative min-h-[360px] overflow-hidden bg-[#001030]">
                <img src={vehicle.image} loading="lazy" decoding="async" alt={vehicle.alt} className="image-zoom absolute inset-0 h-full w-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#001030]/55 via-transparent to-transparent" />
                <span className="absolute top-6 left-6 rounded-full border border-white/28 bg-[#001030]/18 px-3 py-1.5 text-xs font-semibold tracking-[.1em] text-white/82 uppercase backdrop-blur-md">0{index + 1}</span>
              </div>
              <div className="flex flex-col justify-between p-7 sm:p-10 lg:p-12">
                <div className={`transition-[opacity,transform] duration-500 ease-[cubic-bezier(.22,1,.36,1)] ${active === index ? "translate-y-0 opacity-100" : "translate-y-3 opacity-55"}`}>
                  <p className="eyebrow text-[#526f7d]">{vehicle.kicker}</p>
                  <h3 className="mt-4 font-display text-4xl leading-tight tracking-[-.04em] text-[#001030] sm:text-5xl">{vehicle.name}</h3>
                  <p className="mt-5 text-base leading-7 text-[#60727a]">{vehicle.use}</p>
                  <div className="mt-8 flex flex-wrap gap-7 border-y border-[#d4dfe2] py-6 text-sm font-semibold text-[#3270bf]">
                    <span className="inline-flex items-center gap-2"><Users className="size-4" /> {vehicle.seats}</span>
                    <span className="inline-flex items-center gap-2"><Luggage className="size-4" /> {vehicle.luggage}</span>
                  </div>
                  <ul className="mt-7 space-y-3 text-sm text-[#60727a]">
                    {["Considered cabin", "Professional presentation", "Category-based matching"].map((item) => <li key={item} className="flex items-center gap-3"><Check className="size-4 text-[#3270bf]" />{item}</li>)}
                  </ul>
                </div>
                <div className="mt-10 flex items-end justify-between gap-5">
                  <Link href="/booking" className="inline-flex items-center gap-2 text-sm font-semibold text-[#001030] hover:text-[#527181]">Select in booking <ArrowRight className="size-4" /></Link>
                  {prototypeMode && <span className="text-xs font-semibold tracking-[.08em] text-[#77909a] uppercase">Provisional</span>}
                </div>
              </div>
            </article>
          </CarouselItem>
        ))}
      </CarouselContent>
      <div className="mt-7 flex items-center justify-between border-t border-[#cfdbdf] pt-6">
        <p data-testid="fleet-position" className="text-sm font-semibold text-[#60727a]"><span className="text-[#001030]">0{active + 1}</span> / 03</p>
        <div className="flex gap-2">
          <CarouselPrevious className="static size-11 translate-y-0 border-[#b9c9cf] bg-transparent text-[#001030] hover:bg-white" />
          <CarouselNext className="static size-11 translate-y-0 border-[#b9c9cf] bg-transparent text-[#001030] hover:bg-white" />
        </div>
      </div>
    </Carousel>
  );
}

export function PrototypeImageNote() {
  if (!prototypeMode) return null;
  return <span className="inline-flex items-center gap-2 text-xs font-semibold tracking-[.08em] text-white/48 uppercase"><ShieldCheck className="size-4" /> Prototype photography</span>;
}
