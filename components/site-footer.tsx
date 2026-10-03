import Link from "next/link";

import { Brand } from "@/components/site-header";

const groups = [
  { title: "Services", links: ["Airport transfers", "Hourly chauffeur", "City to city", "Private aviation"] },
  { title: "Company", links: ["About Ascenta", "Service standards", "For business", "Contact"] },
  { title: "Legal", links: ["Privacy", "Terms", "Cancellation policy", "Accessibility"] },
];

const prototypeMode = process.env.NEXT_PUBLIC_PROTOTYPE_MODE !== "false";

export function SiteFooter() {
  return (
    <footer className="border-t border-[#cad8dc] bg-[#dde7ea] px-5 py-14 sm:px-8 lg:px-12 xl:px-16">
      <div className="mx-auto grid max-w-[1312px] gap-12 lg:grid-cols-[1.3fr_2fr]">
        <div>
          <Brand />
          <p className="mt-5 max-w-sm text-sm leading-6 text-[#536a75]">Private chauffeur service designed around calm, precise journeys.</p>
          {prototypeMode && <p className="mt-8 text-xs font-semibold tracking-[.12em] text-[#5d7a87] uppercase">Prototype view</p>}
        </div>
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
          {groups.map((group) => (
            <div key={group.title}>
              <h2 className="text-xs font-bold tracking-[.14em] text-[#4e6b78] uppercase">{group.title}</h2>
              <ul className="mt-4 space-y-3">
                {group.links.map((link) => <li key={link}><Link href="#" className="text-sm text-[#435963] transition-colors hover:text-[#071a24]">{link}</Link></li>)}
              </ul>
            </div>
          ))}
        </div>
      </div>
      <div className="mx-auto mt-14 flex max-w-[1312px] flex-col gap-2 border-t border-[#bfd0d6] pt-6 text-xs text-[#657c86] sm:flex-row sm:justify-between">
        <p>© 2026 Ascenta Executive.</p>
        {prototypeMode && <p>Demo experience · No booking or payment is processed.</p>}
      </div>
    </footer>
  );
}
