"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { ArrowLeft, ArrowRight, CheckCircle2, LockKeyhole, Mail, UserRound } from "lucide-react";

import { Brand } from "@/components/site-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { signIn } from "@/lib/api-client";

export default function LoginPage() {
  const [email, setEmail] = useState("demo.customer@ascenta.local");
  const [password, setPassword] = useState("AscentaDemo!2026");
  const [status, setStatus] = useState<"idle" | "submitting" | "error">("idle");
  const [message, setMessage] = useState("");

  async function handleSignIn(event: FormEvent, destination = "/dashboard", credentials = { email, password }) {
    event.preventDefault();
    setStatus("submitting");
    setMessage("");
    try {
      await signIn(credentials);
      window.location.assign(destination);
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "Sign in could not be completed.");
    }
  }

  return (
    <main className="grid min-h-screen bg-[#f4f5f3] lg:grid-cols-[.9fr_1.1fr]">
      <section className="flex flex-col p-5 sm:p-8 lg:p-12">
        <Brand />
        <div className="mx-auto flex w-full max-w-md flex-1 items-center py-12">
          <div className="w-full">
            <p className="eyebrow text-[#8d7040]">Secure account access</p>
            <h1 className="mt-4 font-display text-4xl tracking-[-.04em]">Welcome to Ascenta.</h1>
            <p className="mt-3 text-sm leading-6 text-[#68747a]">Secure access for personal and corporate transportation accounts.</p>
            <Tabs defaultValue="sign-in" className="mt-8">
              <TabsList className="h-11 w-full rounded-xl bg-[#e7eae9] p-1"><TabsTrigger value="sign-in" className="rounded-lg">Sign in</TabsTrigger><TabsTrigger value="create" className="rounded-lg">Create account</TabsTrigger><TabsTrigger value="forgot" className="rounded-lg">Reset</TabsTrigger></TabsList>
              <TabsContent value="sign-in" className="mt-7"><form onSubmit={(event) => void handleSignIn(event)}><AuthFields email={email} password={password} onEmailChange={setEmail} onPasswordChange={setPassword} /><Button type="submit" disabled={status === "submitting"} className="mt-6 h-12 w-full rounded-xl bg-[#0b1a24] text-white">{status === "submitting" ? "Signing in…" : "Enter demo account"} <ArrowRight /></Button>{status === "error" && <p role="alert" className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs leading-5 text-red-700">{message}</p>}</form><Button type="button" variant="outline" disabled={status === "submitting"} onClick={(event) => void handleSignIn(event, "/corporate", { email: "demo.corporate@ascenta.local", password: "AscentaDemo!2026" })} className="mt-3 h-12 w-full rounded-xl bg-white">View corporate demo</Button></TabsContent>
              <TabsContent value="create" className="mt-7"><div className="space-y-4"><Field id="name" label="Full name" placeholder="Your full name" icon={UserRound} /><AuthFields /></div><Button className="mt-6 h-12 w-full rounded-xl bg-[#0b1a24] text-white">Create demo account <ArrowRight /></Button><p className="mt-4 text-xs leading-5 text-[#7b8589]">Email verification, consent, password rules, and server-side role assignment will be implemented with the real authentication layer.</p></TabsContent>
              <TabsContent value="forgot" className="mt-7"><Field id="reset-email" label="Email address" placeholder="name@company.com" icon={Mail} /><Button className="mt-6 h-12 w-full rounded-xl bg-[#0b1a24] text-white">Send reset instructions</Button><p className="mt-4 text-xs leading-5 text-[#7b8589]">No email will be sent during this prototype.</p></TabsContent>
            </Tabs>
          </div>
        </div>
        <Button asChild variant="ghost" className="w-fit rounded-full"><Link href="/"><ArrowLeft /> Return to website</Link></Button>
      </section>

      <aside className="relative hidden overflow-hidden bg-[#07141d] p-12 text-white lg:flex lg:flex-col lg:justify-between">
        <div className="absolute inset-0 opacity-25 [background-image:radial-gradient(circle_at_20%_10%,#d9c394_0,transparent_28%),radial-gradient(circle_at_80%_70%,#315b6c_0,transparent_32%)]" />
        <div className="relative ml-auto flex items-center gap-2 rounded-full border border-white/12 bg-white/5 px-4 py-2 text-xs text-white/58"><LockKeyhole className="size-4 text-[#d9c394]" /> Role-ready architecture</div>
        <div className="relative max-w-xl"><p className="eyebrow text-[#d9c394]">One considered account</p><h2 className="mt-5 font-display text-6xl leading-[1.03] tracking-[-.05em]">Your journeys, organized around you.</h2><ul className="mt-9 space-y-4">{["Review upcoming transportation", "Book for yourself or another traveler", "Keep receipts and preferences together"].map((item) => <li key={item} className="flex items-center gap-3 text-white/68"><CheckCircle2 className="size-5 text-[#d9c394]" />{item}</li>)}</ul></div>
        <p className="relative text-xs leading-5 text-white/35">DEMO DATA · Customer and corporate permissions are enforced by the local API.</p>
      </aside>
    </main>
  );
}

function AuthFields({ email, password, onEmailChange, onPasswordChange }: { email?: string; password?: string; onEmailChange?: (value: string) => void; onPasswordChange?: (value: string) => void }) { return <div className="space-y-4"><Field id="email" label="Email address" placeholder="name@company.com" icon={Mail} value={email} onChange={onEmailChange} /><Field id="password" label="Password" placeholder="Enter your password" icon={LockKeyhole} type="password" value={password} onChange={onPasswordChange} /></div>; }
function Field({ id, label, placeholder, icon: Icon, type = "text", value, onChange }: { id: string; label: string; placeholder: string; icon: typeof Mail; type?: string; value?: string; onChange?: (value: string) => void }) { return <div><Label htmlFor={id} className="mb-2 block text-xs font-bold tracking-[.1em] text-[#6f7a7f] uppercase">{label}</Label><div className="relative"><Icon className="absolute top-1/2 left-4 size-4 -translate-y-1/2 text-[#9b7b43]" /><Input id={id} name={id} type={type} placeholder={placeholder} value={value} onChange={onChange ? (event) => onChange(event.target.value) : undefined} className="h-12 rounded-xl border-[#d9dfe1] bg-white pl-11 shadow-none focus-visible:border-[#9b7b43] focus-visible:ring-[#cbb580]/20" /></div></div>; }
