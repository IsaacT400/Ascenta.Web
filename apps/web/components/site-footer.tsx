import Link from "next/link";

import { Brand } from "@/components/site-header";

const groups = [
  { title: "Journey", links: [{ label: "Airport transfer", href: "/booking?service=AIRPORT_TRANSFER" }, { label: "By the hour", href: "/booking?service=HOURLY" }, { label: "City to city", href: "/booking?service=CITY_TO_CITY" }] },
  { title: "Explore", links: [{ label: "Journey requests", href: "/services" }, { label: "Vehicle categories", href: "/fleet" }, { label: "For business", href: "/business" }] },
  { title: "Account", links: [{ label: "Sign in", href: "/login" }, { label: "Customer account", href: "/dashboard" }, { label: "Start a request", href: "/#journey" }] },
];

export function SiteFooter() {
  return <footer className="border-t border-[#a9c8ec] bg-[#c6defc] px-5 py-14 sm:px-8 lg:px-12 xl:px-16">
    <div className="mx-auto grid max-w-[1240px] gap-12 lg:grid-cols-[1.3fr_2fr]">
      <div><Brand /><p className="mt-5 max-w-sm text-sm leading-6 text-[#344c6c]">Executive transportation requests, with a clear account path.</p><p className="mt-8 text-xs font-semibold tracking-[.04em] text-[#3d587c]">Local development experience · requests require review</p></div>
      <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">{groups.map((group) => <div key={group.title}><h2 className="text-xs font-bold tracking-[.12em] text-[#344c6c] uppercase">{group.title}</h2><ul className="mt-4 space-y-3">{group.links.map((link) => <li key={link.href}><Link href={link.href} className="text-sm text-[#344c6c] hover:text-[#001030]">{link.label}</Link></li>)}</ul></div>)}</div>
    </div>
    <div className="mx-auto mt-14 flex max-w-[1240px] flex-col gap-2 border-t border-[#a9c8ec] pt-6 text-xs text-[#405b7e] sm:flex-row sm:justify-between"><p>© 2026 ASCENTA · EXECUTIVE TRANSPORTATION</p><p>Request submission does not confirm a booking or payment.</p></div>
  </footer>;
}
