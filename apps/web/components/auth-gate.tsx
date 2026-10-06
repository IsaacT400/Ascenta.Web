"use client";

import { useEffect, useState, type ReactNode } from "react";
import { LoaderCircle, LockKeyhole } from "lucide-react";

import type { Role } from "@ascenta/shared";
import { getCurrentSession } from "@/lib/api-client";

export function AuthGate({ children, requiredRole }: { children: ReactNode; requiredRole?: Role }) {
  const [state, setState] = useState<"checking" | "allowed" | "forbidden">("checking");
  useEffect(() => {
    let active = true;
    void getCurrentSession().then(({ user }) => {
      if (active) setState(!requiredRole || user.roles.includes(requiredRole) ? "allowed" : "forbidden");
    }).catch(() => {
      if (active) window.location.replace(`/login?next=${encodeURIComponent(window.location.pathname + window.location.search)}`);
    });
    return () => { active = false; };
  }, [requiredRole]);
  if (state === "allowed") return children;
  const message = requiredRole === "ASCENTA_ADMIN" ? "This account cannot open the internal operations queue." : "This account does not have corporate portal access.";
  return <main className="grid min-h-screen place-items-center bg-[#f7f9fd] px-6"><div className="max-w-sm text-center">{state === "checking" ? <LoaderCircle className="mx-auto size-7 animate-spin text-[#3270bf]" /> : <LockKeyhole className="mx-auto size-7 text-[#3270bf]" />}<h1 className="mt-5 font-display text-3xl tracking-[-.03em]">{state === "checking" ? "Checking your account…" : "Authorized account required"}</h1><p className="mt-3 text-sm leading-6 text-[#53627a]">{state === "checking" ? "Securely restoring your ASCENTA session." : message}</p>{state === "forbidden" && <a href="/login" className="mt-6 inline-flex min-h-11 items-center rounded-full bg-[#001030] px-5 py-3 text-sm font-semibold text-white">Return to sign in</a>}</div></main>;
}
