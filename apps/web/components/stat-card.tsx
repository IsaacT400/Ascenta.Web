import type { LucideIcon } from "lucide-react";

export function StatCard({ label, value, detail, icon: Icon, tone = "light" }: { label: string; value: string; detail: string; icon: LucideIcon; tone?: "light" | "dark" }) {
  const dark = tone === "dark";
  return (
    <article className={`rounded-[1.25rem] border p-5 sm:p-6 ${dark ? "border-[#183340] bg-[#001030] text-white" : "border-[#dde2e3] bg-white text-[#001030]"}`}>
      <div className="flex items-center justify-between gap-4">
        <p className={`text-xs font-bold tracking-[.12em] uppercase ${dark ? "text-white/48" : "text-[#7b8589]"}`}>{label}</p>
        <span className={`grid size-9 place-items-center rounded-full ${dark ? "bg-white/8 text-[#92bef2]" : "bg-[#f0ece2] text-[#8d713f]"}`}><Icon className="size-4" strokeWidth={1.7} /></span>
      </div>
      <p className="mt-5 font-display text-3xl tracking-[-.035em] sm:text-4xl">{value}</p>
      <p className={`mt-2 text-xs ${dark ? "text-white/48" : "text-[#7b8589]"}`}>{detail}</p>
    </article>
  );
}
