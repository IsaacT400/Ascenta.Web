import type { Metadata } from "next";
import Link from "next/link";

import { AuthGate } from "@/components/auth-gate";
import { Brand } from "@/components/site-header";
import { OperationsQueue } from "@/components/operations-queue";

export const metadata: Metadata = { title: "Operations queue" };

export default function AdminPage() {
  return <AuthGate requiredRole="ASCENTA_ADMIN"><main className="min-h-screen bg-[#f7f9fd]"><header className="border-b border-[#d5dfec] bg-white"><div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-3 sm:px-8"><Brand /><Link href="/" className="text-sm font-semibold text-[#244f88] hover:underline">Public website</Link></div></header><div className="mx-auto max-w-6xl px-5 py-10 sm:px-8 sm:py-14"><OperationsQueue /></div></main></AuthGate>;
}
