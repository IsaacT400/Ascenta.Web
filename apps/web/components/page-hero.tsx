import type { ReactNode } from "react";

export function PageHero({ eyebrow, title, description, action }: { eyebrow: string; title: string; description: string; action?: ReactNode }) {
  return (
    <section className="border-b border-white/10 bg-[#07141d] px-5 py-16 text-white sm:px-8 sm:py-20 lg:px-12 xl:px-16">
      <div className="mx-auto grid max-w-[1312px] gap-8 lg:grid-cols-[1fr_.8fr] lg:items-end">
        <div>
          <p className="eyebrow text-[#d9c394]">{eyebrow}</p>
          <h1 className="mt-5 max-w-3xl font-display text-[clamp(3rem,7vw,6.5rem)] leading-[.95] tracking-[-.05em] text-balance">{title}</h1>
        </div>
        <div className="lg:pb-2">
          <p className="max-w-xl text-lg leading-8 text-white/64">{description}</p>
          {action ? <div className="mt-7">{action}</div> : null}
        </div>
      </div>
    </section>
  );
}
