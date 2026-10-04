"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowUpRight, Menu } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

const navigation = [
  { label: "Services", href: "/services" },
  { label: "Fleet", href: "/fleet" },
  { label: "For business", href: "/corporate" },
  { label: "About", href: "/#about" },
];

export function SiteHeader() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className={`sticky top-0 z-50 border-b backdrop-blur-xl transition-[height,background-color,border-color,box-shadow] duration-300 ease-[cubic-bezier(.22,1,.36,1)] ${scrolled ? "h-[68px] border-[#ccd9dd] bg-white/92 shadow-[0_10px_35px_rgba(7,26,36,.06)]" : "h-[76px] border-transparent bg-[#f5f3ee]/88"}`}>
      <div className="mx-auto flex h-full max-w-[1440px] items-center justify-between px-5 sm:px-8 lg:px-12 xl:px-16">
        <Brand />
        <nav aria-label="Primary navigation" className="hidden items-center gap-8 lg:flex">
          {navigation.map((item) => (
            <Link key={item.label} href={item.href} className="text-[13px] font-semibold text-[#304650] transition-colors duration-200 hover:text-[#355b6d]">{item.label}</Link>
          ))}
        </nav>
        <div className="flex items-center gap-2.5">
          <Button asChild variant="ghost" className="hidden h-10 rounded-full px-4 text-[13px] font-semibold sm:inline-flex"><Link href="/login">Sign in</Link></Button>
          <Button asChild className="h-10 rounded-full bg-[#0d2a38] px-5 text-[13px] text-white hover:bg-[#355b6d]"><Link href="/booking">Book a ride <ArrowUpRight className="size-3.5" /></Link></Button>
          <Sheet>
            <SheetTrigger asChild><Button variant="outline" size="icon" className="size-10 rounded-full border-[#ccd3d6] bg-transparent lg:hidden" aria-label="Open navigation"><Menu className="size-4" /></Button></SheetTrigger>
            <SheetContent className="w-[88%] border-[#294653] bg-[#071a24] text-white sm:max-w-md">
              <SheetHeader className="border-b border-white/10 px-6 py-6 text-left">
                <SheetTitle className="text-white"><Brand inverted /></SheetTitle>
                <SheetDescription className="text-white/50">Private Chauffeur Service</SheetDescription>
              </SheetHeader>
              <nav aria-label="Mobile navigation" className="flex flex-col px-6 py-6">
                {navigation.map((item) => <Link key={item.label} href={item.href} className="border-b border-white/10 py-5 font-display text-2xl text-white">{item.label}</Link>)}
                <Link href="/login" className="border-b border-white/10 py-5 font-display text-2xl text-white">Sign in</Link>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}

export function Brand({ inverted = false }: { inverted?: boolean }) {
  return (
    <Link href="/" aria-label="Ascenta Executive home" className="inline-flex items-center gap-3">
      <span className={`grid size-9 place-items-center rounded-full border transition-transform duration-300 ${inverted ? "border-white/35 text-[#b4c9d1]" : "border-[#6f93a3]/55 text-[#355b6d]"}`}><span className="font-display text-lg leading-none">A</span></span>
      <span className="leading-none">
        <span className={`block font-display text-[17px] tracking-[.15em] ${inverted ? "text-white" : "text-[#071a24]"}`}>ASCENTA</span>
        <span className={`mt-1 block text-[8px] font-bold tracking-[.32em] ${inverted ? "text-white/45" : "text-[#60727a]"}`}>EXECUTIVE</span>
      </span>
    </Link>
  );
}
