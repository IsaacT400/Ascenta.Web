"use client";

import { useEffect, useState, type ReactNode } from "react";
import { LoaderCircle, LockKeyhole } from "lucide-react";

import type { Role } from "@ascenta/shared";
import { getCurrentSession } from "@/lib/api-client";

export function AuthGate({ children, requiredRole }: { children: ReactNode; requiredRole?: Role }) {
  const [state, setState] = useState<"checking" | "allowed" | "forbidden">("checking");

  useEffect(() => {
    let active = true;
    void getCurrentSession()
      .then(({ user }) => {
        if (!active) return;
        setState(!requiredRole || user.roles.includes(requiredRole) ? "allowed" : "forbidden");
      })
      .catch(() => {
        if (active) window.location.replace(`/login?next=${encodeURIComponent(window.location.pathname)}`);
      });
    return () => { active = false; };
  }, [requiredRole]);

  if (state === "allowed") return children;
  return <main className="grid min-h-screen place-items-center bg-[#f4f5f3] px-6"><div className="max-w-sm text-center">{state === "checking" ? <LoaderCircle className="mx-auto size-7 animate-spin text-[#8d7040]" /> : <LockKeyhole className="mx-auto size-7 text-[#8d7040]" />}<h1 className="mt-5 font-display text-3xl tracking-[-.03em]">{state === "checking" ? "Checking your account…" : "Corporate access required"}</h1><p className="mt-3 text-sm leading-6 text-[#68747a]">{state === "checking" ? "Securely restoring your Ascenta session." : "This account does not have permission to open the corporate portal."}</p>{state === "forbidden" && <a href="/login" className="mt-6 inline-flex rounded-full bg-[#0b1a24] px-5 py-3 text-sm font-semibold text-white">Return to sign in</a>}</div></main>;
}
