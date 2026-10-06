import type { Metadata } from "next";

import { AuthGate } from "@/components/auth-gate";
import { CustomerRequests } from "@/components/customer-requests";
import { DashboardShell } from "@/components/dashboard-shell";

export const metadata: Metadata = { title: "Corporate account" };

export default function CorporatePage() {
  return <AuthGate requiredRole="CORPORATE_ADMIN"><DashboardShell mode="corporate" active="Requests" title="Corporate account" description="Organization requests"><CustomerRequests corporate /></DashboardShell></AuthGate>;
}
