import type { Metadata } from "next";

import { DashboardShell } from "@/components/dashboard-shell";
import { UsageMatrix } from "@/components/usage-matrix";

export const metadata: Metadata = { title: "Transportation Usage Matrix" };

export default function UsageMatrixPage() {
  return <DashboardShell mode="corporate" active="Usage Matrix" title="Transportation Usage Matrix" description="Role-aware account intelligence · DEMO DATA"><UsageMatrix /></DashboardShell>;
}
