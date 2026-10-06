import type { Metadata } from "next";

import { AuthGate } from "@/components/auth-gate";
import { CustomerRequests } from "@/components/customer-requests";
import { DashboardShell } from "@/components/dashboard-shell";

export const metadata: Metadata = { title: "Your ASCENTA account" };

export default function DashboardPage() {
  return <AuthGate><DashboardShell mode="customer" active="Overview" title="Your account" description="Requests and journey details"><CustomerRequests /></DashboardShell></AuthGate>;
}
