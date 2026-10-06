"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { ArrowUpRight, Menu } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

const navigation = [
  { label: "Services", href: "/services" },
  { label: "Fleet", href: "/fleet" },
  { label: "For business", href: "/business" },
  { label: "About", href: "/#experience" },
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
    <header className={`sticky top-0 z-50 border-b backdrop-blur-xl transition-[height,background-color,border-color,box-shadow] duration-300 ease-[cubic-bezier(.22,1,.36,1)] ${scrolled ? "h-[68px] border-[#ccd9dd] bg-white/92 shadow-[0_10px_35px_rgba(7,26,36,.06)]" : "h-[76px] border-transparent bg-[#f7f9fd]/88"}`}>
      <div className="mx-auto flex h-full min-w-0 max-w-[1440px] items-center justify-between px-4 sm:px-8 lg:px-12 xl:px-16">
        <div className="shrink-0"><Brand /></div>
        <nav aria-label="Primary navigation" className="hidden items-center gap-8 lg:flex">
          {navigation.map((item) => (
            <Link key={item.label} href={item.href} className="text-[13px] font-semibold text-[#304650] transition-colors duration-200 hover:text-[#3270bf]">{item.label}</Link>
          ))}
        </nav>
        <div className="flex shrink-0 items-center gap-1.5 sm:gap-2.5">
          <Button asChild variant="ghost" className="hidden h-10 rounded-full px-4 text-[13px] font-semibold sm:inline-flex"><Link href="/login">Sign in</Link></Button>
          <Button asChild className="h-9 rounded-full bg-[#001030] px-3 text-[12px] text-white hover:bg-[#3270bf] sm:h-10 sm:px-5 sm:text-[13px]"><Link href="/booking"><span className="sm:hidden">Book</span><span className="hidden sm:inline">Book a ride</span><ArrowUpRight className="hidden size-3.5 sm:inline" /></Link></Button>
          <Sheet>
            <SheetTrigger asChild><Button variant="outline" size="icon" className="size-10 rounded-full border-[#ccd3d6] bg-transparent lg:hidden" aria-label="Open navigation"><Menu className="size-4" /></Button></SheetTrigger>
            <SheetContent className="w-[88%] border-[#294653] bg-[#001030] text-white sm:max-w-md">
              <SheetHeader className="border-b border-white/10 px-6 py-6 text-left">
                <SheetTitle className="text-white"><Brand /></SheetTitle>
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

export function Brand() {
  return (
    <Link href="/" aria-label="ASCENTA Executive Transportation — home" className="inline-flex items-center rounded-md bg-white p-0.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3270bf]">
      <Image src="/ascenta-logo.png" alt="ASCENTA — Executive Transportation" className="brand-mark" width={58} height={58} priority />
    </Link>
  );
}
