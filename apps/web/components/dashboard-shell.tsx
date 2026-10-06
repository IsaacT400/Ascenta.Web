"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Building2, CalendarDays, Home, LogOut, Plus,
} from "lucide-react";

import { Brand } from "@/components/site-header";
import { Button } from "@/components/ui/button";
import { getCurrentSession, signOut } from "@/lib/api-client";
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
  { label: "Prepare a request", href: "/booking", icon: Plus },
  { label: "Requests", href: "/dashboard#requests-title", icon: CalendarDays },
];

const corporateNav = [
  { label: "Requests", href: "/corporate", icon: Building2 },
  { label: "Prepare a request", href: "/booking", icon: Plus },
];

export function DashboardShell({ children, active, mode, title, description }: DashboardShellProps) {
  const router = useRouter();
  const [accountName, setAccountName] = useState("Account");
  const [accountEmail, setAccountEmail] = useState("");
  useEffect(() => { void getCurrentSession().then(({ user }) => { setAccountName(user.displayName); setAccountEmail(user.email); }).catch(() => undefined); }, []);
  async function handleSignOut() {
    try { await signOut(); } finally { router.replace("/login"); }
  }
  const nav = mode === "corporate" ? corporateNav : customerNav;
  return (
    <SidebarProvider>
      <Sidebar collapsible="offcanvas" className="border-[#1e3540]">
        <SidebarHeader className="px-5 py-6"><Brand /></SidebarHeader>
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
            <SidebarMenuItem><SidebarMenuButton onClick={() => void handleSignOut()} className="h-10 px-3 text-white/62 hover:bg-white/8 hover:text-white"><LogOut /><span>Sign out</span></SidebarMenuButton></SidebarMenuItem>
          </SidebarMenu>
          <div className="mt-3 flex items-center gap-3 rounded-xl border border-white/10 p-3">
            <span className="grid size-9 shrink-0 place-items-center rounded-full bg-[#92bef2] text-sm font-bold text-[#001030]">{accountName.slice(0, 1).toUpperCase()}</span>
            <span className="min-w-0"><span className="block truncate text-sm font-semibold text-white">{accountName}</span><span className="block truncate text-xs text-white/65">{accountEmail}</span></span>
          </div>
        </SidebarFooter>
      </Sidebar>

      <SidebarInset className="min-w-0 bg-[#f7f9fd]">
        <header className="sticky top-0 z-30 flex min-h-18 items-center justify-between border-b border-[#dfe3e4] bg-[#f7f9fd]/94 px-4 backdrop-blur-xl sm:px-7 lg:px-10">
          <div className="flex items-center gap-3">
            <SidebarTrigger className="size-9 rounded-full border border-[#d5dbdd] md:hidden" />
            <div><h1 className="font-display text-2xl tracking-[-.025em] text-[#001030]">{title}</h1>{description && <p className="hidden text-xs text-[#788287] sm:block">{description}</p>}</div>
          </div>
          <div className="flex items-center gap-2">
            {mode === "customer" && <Button asChild variant="outline" className="hidden h-10 rounded-full bg-white sm:flex"><Link href="/business"><Building2 /> For business</Link></Button>}
            <Button asChild className="h-10 rounded-full bg-[#001030] text-white"><Link href="/booking"><Plus /> <span className="hidden sm:inline">Book a ride</span><span className="sm:hidden">Book</span></Link></Button>
          </div>
        </header>
        <div className="w-full p-4 sm:p-7 lg:p-10">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
