import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { CatalogChoices } from "@/components/catalog-choices";
import { PageHero } from "@/components/page-hero";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = { title: "Journey requests", description: "Prepare an ASCENTA executive transportation request." };

export default function ServicesPage() {
  return <main className="min-h-screen bg-[#f7f9fd]"><SiteHeader /><PageHero eyebrow="Journey requests" title="Begin with the details of your journey." description="Choose a request type from the active catalog. Sending details starts a review request; it does not confirm availability or a price." action={<Button asChild className="h-12 rounded-lg bg-[#3270bf] px-6 text-white"><Link href="/booking">Prepare a request <ArrowRight /></Link></Button>} /><CatalogChoices type="service" /><SiteFooter /></main>;
}
