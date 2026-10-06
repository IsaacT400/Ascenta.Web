import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { CatalogChoices } from "@/components/catalog-choices";
import { PageHero } from "@/components/page-hero";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = { title: "Vehicle categories", description: "Review categories currently listed in the ASCENTA request catalog." };

export default function FleetPage() {
  return <main className="min-h-screen bg-[#f7f9fd]"><SiteHeader /><PageHero eyebrow="Vehicle categories" title="Choose a preferred category." description="Categories come from the active local catalog. A selection remains a preference until the operations team reviews your request." action={<Button asChild className="h-12 rounded-lg bg-[#3270bf] px-6 text-white"><Link href="/booking">Prepare a request <ArrowRight /></Link></Button>} /><CatalogChoices type="vehicle" /><SiteFooter /></main>;
}
