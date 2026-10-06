import type { Metadata } from "next";

import { BookingWizard } from "@/components/booking-wizard";
import { SiteHeader } from "@/components/site-header";

export const metadata: Metadata = { title: "Book a Ride", description: "Prototype the Ascenta Executive booking experience." };

export default function BookingPage() {
  return (
    <main className="min-h-screen overflow-x-hidden bg-[#f7f9fd]">
      <SiteHeader />
      <section className="border-b border-[#dce1e3] bg-[#eef0ed] px-5 py-10 sm:px-8 lg:px-12 xl:px-16">
        <div className="mx-auto max-w-[1240px]"><p className="eyebrow text-[#3270bf]">Interactive prototype</p><h1 className="mt-3 font-display text-4xl tracking-[-.04em] text-[#001030] sm:text-5xl">Book your journey</h1><p className="mt-3 max-w-2xl text-base leading-7 text-[#68747a]">Explore the proposed reservation flow with fictional trip information. No availability, price, or payment is processed.</p></div>
      </section>
      <section className="px-5 py-8 sm:px-8 lg:px-12 lg:py-12 xl:px-16"><div className="mx-auto max-w-[1240px]"><BookingWizard /></div></section>
    </main>
  );
}
