import type { Metadata } from "next";

import { BookingWizard } from "@/components/booking-wizard";
import { SiteHeader } from "@/components/site-header";

export const metadata: Metadata = { title: "Prepare a Journey Request", description: "Prepare an executive transportation request for ASCENTA team review." };

export default function BookingPage() {
  return (
    <main className="min-h-screen overflow-x-hidden bg-[#f7f9fd]">
      <SiteHeader />
      <section className="border-b border-[#d5dfec] bg-[#f7f9fd] px-5 py-10 sm:px-8 lg:px-12 xl:px-16">
        <div className="mx-auto max-w-[1240px]"><p className="eyebrow text-[#3270bf]">Journey request</p><h1 className="mt-3 font-display text-4xl tracking-[-.04em] text-[#001030] sm:text-5xl">Prepare your journey</h1><p className="mt-3 max-w-2xl text-base leading-7 text-[#53627a]">Review and edit your journey details, then send them to the ASCENTA team. A submitted request does not confirm availability or price.</p></div>
      </section>
      <section className="px-5 py-8 sm:px-8 lg:px-12 lg:py-12 xl:px-16"><div className="mx-auto max-w-[1240px]"><BookingWizard /></div></section>
    </main>
  );
}
