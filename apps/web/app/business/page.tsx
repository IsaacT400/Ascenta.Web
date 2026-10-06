import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Building2, ClipboardList, ShieldCheck } from "lucide-react";

import { PageHero } from "@/components/page-hero";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = { title: "Business travel" };

export default function BusinessPage() {
  return <main className="min-h-screen bg-white"><SiteHeader /><PageHero eyebrow="For organizations" title="Business travel requests, with a clear account path." description="Authorized corporate account members can review requests associated with their organization. The portal currently shows request records only; billing, travel analytics, and traveler management are not available." action={<Button asChild className="h-12 rounded-lg bg-[#3270bf] px-6 text-white"><Link href="/login?next=%2Fcorporate">Sign in to a corporate account <ArrowRight /></Link></Button>} /><section className="px-5 py-14 sm:px-8 lg:px-12"><div className="mx-auto grid max-w-5xl gap-4 md:grid-cols-3">{[{ icon: ClipboardList, title: "Request record", body: "A submitted request keeps its reference and review status." }, { icon: Building2, title: "Organization access", body: "The API checks organization membership for private requests." }, { icon: ShieldCheck, title: "Role controlled", body: "Corporate access is separate from ASCENTA internal operations." }].map(({ icon: Icon, title, body }) => <article key={title} className="rounded-xl border border-[#d5dfec] bg-[#f7f9fd] p-6"><Icon className="size-5 text-[#3270bf]" /><h2 className="mt-4 font-display text-xl text-[#001030]">{title}</h2><p className="mt-2 text-sm leading-6 text-[#53627a]">{body}</p></article>)}</div></section><SiteFooter /></main>;
}
