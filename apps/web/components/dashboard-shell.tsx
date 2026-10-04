"use client";

import Link from "next/link";
import {
  BarChart3, Building2, CalendarDays, CreditCard, FileText, History,
  Home, MapPinned, Plus, Settings, UsersRound,
} from "lucide-react";

import { Brand } from "@/components/site-header";
import { Button } from "@/components/ui/button";
import {
  Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupContent, SidebarGroupLabel,
  SidebarHeader, SidebarInset, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarProvider,
  SidebarSeparator, SidebarTrigger,
} from "@/components/ui/sidebar";

type DashboardShellProps = {
  children: React.ReactNode;
  active: string;
  mode: "customer" | "corporate";
  title: string;
  description?: string;
};

const customerNav = [
  { label: "Overview", href: "/dashboard", icon: Home },
  { label: "Book a ride", href: "/booking", icon: Plus },
  { label: "Upcoming rides", href: "/dashboard#upcoming", icon: CalendarDays },
  { label: "Ride history", href: "/dashboard#history", icon: History },
  { label: "Saved locations", href: "/dashboard#locations", icon: MapPinned },
  { label: "Receipts & invoices", href: "/dashboard#receipts", icon: FileText },
];

const corporateNav = [
  { label: "Overview", href: "/corporate", icon: Building2 },
  { label: "Book a ride", href: "/booking", icon: Plus },
  { label: "Reservations", href: "/corporate#reservations", icon: CalendarDays },
  { label: "Travelers", href: "/corporate#travelers", icon: UsersRound },
  { label: "Usage Matrix", href: "/corporate/usage", icon: BarChart3 },
  { label: "Invoices", href: "/corporate#invoices", icon: CreditCard },
];

export function DashboardShell({ children, active, mode, title, description }: DashboardShellProps) {
  const nav = mode === "corporate" ? corporateNav : customerNav;
  return (
    <SidebarProvider>
      <Sidebar collapsible="offcanvas" className="border-[#1e3540]">
        <SidebarHeader className="px-5 py-6"><Brand inverted /></SidebarHeader>
        <SidebarSeparator className="bg-white/10" />
        <SidebarContent className="px-3 py-4">
          <SidebarGroup>
            <SidebarGroupLabel className="px-3 text-[10px] font-bold tracking-[.16em] text-white/42 uppercase">{mode === "corporate" ? "Corporate account" : "My account"}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu className="gap-1.5">
                {nav.map(({ label, href, icon: Icon }) => (
                  <SidebarMenuItem key={label}>
                    <SidebarMenuButton asChild isActive={active === label} className="h-10 rounded-lg px-3 text-white/68 data-[active=true]:bg-white/10 data-[active=true]:text-white hover:bg-white/8 hover:text-white">
                      <Link href={href}><Icon strokeWidth={1.6} /><span>{label}</span></Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter className="px-4 pb-5">
          <SidebarMenu>
            <SidebarMenuItem><SidebarMenuButton asChild className="h-10 px-3 text-white/62 hover:bg-white/8 hover:text-white"><Link href="/"><Home /><span>Public website</span></Link></SidebarMenuButton></SidebarMenuItem>
            <SidebarMenuItem><SidebarMenuButton className="h-10 px-3 text-white/62 hover:bg-white/8 hover:text-white"><Settings /><span>Settings</span></SidebarMenuButton></SidebarMenuItem>
          </SidebarMenu>
          <div className="mt-3 flex items-center gap-3 rounded-xl border border-white/10 p-3">
            <span className="grid size-9 shrink-0 place-items-center rounded-full bg-[#d9c394] text-sm font-bold text-[#07141d]">{mode === "corporate" ? "AC" : "AM"}</span>
            <span className="min-w-0"><span className="block truncate text-sm font-semibold text-white">{mode === "corporate" ? "Apex Consulting" : "Alex Morgan"}</span><span className="block truncate text-xs text-white/42">Demo account</span></span>
          </div>
        </SidebarFooter>
      </Sidebar>

      <SidebarInset className="min-w-0 bg-[#f4f5f3]">
        <header className="sticky top-0 z-30 flex min-h-18 items-center justify-between border-b border-[#dfe3e4] bg-[#f4f5f3]/94 px-4 backdrop-blur-xl sm:px-7 lg:px-10">
          <div className="flex items-center gap-3">
            <SidebarTrigger className="size-9 rounded-full border border-[#d5dbdd] md:hidden" />
            <div><h1 className="font-display text-2xl tracking-[-.025em] text-[#0b1a24]">{title}</h1>{description && <p className="hidden text-xs text-[#788287] sm:block">{description}</p>}</div>
          </div>
          <div className="flex items-center gap-2">
            {mode === "customer" && <Button asChild variant="outline" className="hidden h-10 rounded-full bg-white sm:flex"><Link href="/corporate"><Building2 /> Corporate demo</Link></Button>}
            <Button asChild className="h-10 rounded-full bg-[#0b1a24] text-white"><Link href="/booking"><Plus /> <span className="hidden sm:inline">Book a ride</span><span className="sm:hidden">Book</span></Link></Button>
          </div>
        </header>
        <div className="w-full p-4 sm:p-7 lg:p-10">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
