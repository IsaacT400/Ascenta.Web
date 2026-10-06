"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { ArrowLeft, ArrowRight, CheckCircle2, LockKeyhole, Mail, UserRound } from "lucide-react";

import { Brand } from "@/components/site-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { registerAccount, signIn, verifyEmail } from "@/lib/api-client";

type Activity = "idle" | "working" | "error" | "done";

export default function LoginPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [signInState, setSignInState] = useState<Activity>("idle");
  const [registerState, setRegisterState] = useState<Activity>("idle");
  const [message, setMessage] = useState("");
  const [verificationToken, setVerificationToken] = useState("");
  const [verified, setVerified] = useState(false);

  async function handleSignIn(event: FormEvent) {
    event.preventDefault();
    setSignInState("working"); setMessage("");
    try {
      await signIn({ email, password });
      const next = new URLSearchParams(window.location.search).get("next");
      const destination = next && next.startsWith("/") && !next.startsWith("//") ? next : "/dashboard";
      window.location.assign(destination);
    } catch (error) {
      setSignInState("error");
      setMessage(error instanceof Error ? error.message : "Sign in could not be completed.");
    }
  }

  async function handleRegister(event: FormEvent) {
    event.preventDefault(); setRegisterState("working"); setMessage(""); setVerified(false);
    try {
      const result = await registerAccount({ email, displayName: name, password, termsAccepted: true });
      if (!result.localVerificationToken) throw new Error("No local verification message is available. Ask an administrator to check the local API configuration.");
      setVerificationToken(result.localVerificationToken);
      setRegisterState("done");
      setMessage("Your local verification message is ready below. No email was sent.");
    } catch (error) {
      setRegisterState("error"); setMessage(error instanceof Error ? error.message : "Account registration could not be completed.");
    }
  }

  async function handleVerify() {
    setRegisterState("working"); setMessage("");
    try {
      await verifyEmail(verificationToken);
      setVerified(true); setRegisterState("done"); setMessage("Email verified. Sign in to return to your journey.");
    } catch (error) {
      setRegisterState("error"); setMessage(error instanceof Error ? error.message : "Verification could not be completed.");
    }
  }

  return (
    <main className="grid min-h-screen bg-[#f7f9fd] lg:grid-cols-[.88fr_1.12fr]">
      <section className="flex flex-col p-5 sm:p-8 lg:p-12">
        <Brand />
        <div className="mx-auto flex w-full max-w-md flex-1 items-center py-12">
          <div className="w-full">
            <p className="eyebrow text-[#3270bf]">Your ASCENTA account</p>
            <h1 className="mt-4 font-display text-4xl tracking-[-.04em]">Welcome.</h1>
            <p className="mt-3 text-sm leading-6 text-[#53627a]">Sign in or create a personal account to continue your journey request.</p>
            <Tabs defaultValue="sign-in" className="mt-8">
              <TabsList className="h-11 w-full rounded-xl bg-[#e8f0fb] p-1"><TabsTrigger value="sign-in" className="rounded-lg">Sign in</TabsTrigger><TabsTrigger value="create" className="rounded-lg">Create account</TabsTrigger></TabsList>
              <TabsContent value="sign-in" className="mt-7">
                <form onSubmit={(event) => void handleSignIn(event)} className="space-y-4">
                  <Field id="email" label="Email address" placeholder="name@example.com" icon={Mail} value={email} onChange={setEmail} type="email" autoComplete="email" required />
                  <Field id="password" label="Password" placeholder="Your password" icon={LockKeyhole} value={password} onChange={setPassword} type="password" autoComplete="current-password" required />
                  <Button type="submit" disabled={signInState === "working"} className="h-12 w-full rounded-lg bg-[#3270bf] text-white">{signInState === "working" ? "Signing in…" : "Sign in"} <ArrowRight /></Button>
                </form>
              </TabsContent>
              <TabsContent value="create" className="mt-7">
                {!verified ? <form onSubmit={(event) => void handleRegister(event)} className="space-y-4">
                  <Field id="full-name" label="Full name" placeholder="Your name" icon={UserRound} value={name} onChange={setName} autoComplete="name" required />
                  <Field id="register-email" label="Email address" placeholder="name@example.com" icon={Mail} value={email} onChange={setEmail} type="email" autoComplete="email" required />
                  <Field id="register-password" label="Password" placeholder="At least 12 characters" icon={LockKeyhole} value={password} onChange={setPassword} type="password" autoComplete="new-password" minLength={12} required />
                  <label className="flex items-start gap-3 text-sm leading-5 text-[#53627a]"><input type="checkbox" checked={acceptedTerms} onChange={(event) => setAcceptedTerms(event.target.checked)} required className="mt-1 size-4 accent-[#3270bf]" /><span>I agree to continue with a local development account. This is not a published terms agreement.</span></label>
                  <Button type="submit" disabled={!acceptedTerms || registerState === "working"} className="h-12 w-full rounded-lg bg-[#3270bf] text-white">{registerState === "working" ? "Creating account…" : "Create account"} <ArrowRight /></Button>
                </form> : <div className="rounded-xl border border-[#b7d6bf] bg-[#f2fbf3] p-5 text-[#18492b]"><CheckCircle2 className="size-6" /><p className="mt-3 font-semibold">Email verified</p><p className="mt-1 text-sm">Sign in to continue the journey you saved.</p></div>}
                {verificationToken && !verified && <div className="mt-4 rounded-xl border border-[#c7d5e7] bg-white p-4"><p className="text-sm font-semibold text-[#001030]">Local verification message</p><p className="mt-1 text-xs leading-5 text-[#53627a]">Development only. This token remains in this local page and was not emailed.</p><Button type="button" onClick={() => void handleVerify()} className="mt-3 h-10 rounded-lg bg-[#001030] text-white">Verify account locally</Button></div>}
              </TabsContent>
            </Tabs>
            {message && <p role={registerState === "error" || signInState === "error" ? "alert" : "status"} className={`mt-4 rounded-lg border px-3 py-2 text-sm leading-5 ${registerState === "error" || signInState === "error" ? "border-red-200 bg-red-50 text-red-700" : "border-[#c7d5e7] bg-white text-[#34435c]"}`}>{message}</p>}
          </div>
        </div>
        <Button asChild variant="ghost" className="w-fit rounded-full"><Link href="/"><ArrowLeft /> Return to website</Link></Button>
      </section>
      <aside className="relative hidden overflow-hidden bg-[#001030] p-12 text-white lg:flex lg:flex-col lg:justify-between">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_22%_12%,rgba(146,190,242,.22),transparent_34%),radial-gradient(circle_at_82%_78%,rgba(50,112,191,.28),transparent_38%)]" />
        <div className="relative ml-auto rounded-md bg-white p-1"><Brand /></div>
        <div className="relative max-w-xl"><p className="eyebrow text-[#92bef2]">One considered account</p><h2 className="mt-5 font-display text-6xl leading-[1.03] tracking-[-.05em]">Your journey, carried with care.</h2><ul className="mt-9 space-y-4">{["Keep your trip details while you sign in", "See the request status in your account", "A request is received for review, not confirmed"].map((item) => <li key={item} className="flex items-center gap-3 text-white/75"><CheckCircle2 className="size-5 text-[#92bef2]" />{item}</li>)}</ul></div>
        <p className="relative text-xs leading-5 text-white/55">Local development verification is not external email delivery.</p>
      </aside>
    </main>
  );
}

function Field({ id, label, placeholder, icon: Icon, type = "text", value, onChange, ...props }: { id: string; label: string; placeholder: string; icon: typeof Mail; type?: string; value: string; onChange: (value: string) => void; autoComplete?: string; minLength?: number; required?: boolean }) {
  return <div><Label htmlFor={id} className="mb-2 block text-xs font-semibold text-[#42536b]">{label}</Label><div className="relative"><Icon className="absolute top-1/2 left-4 size-4 -translate-y-1/2 text-[#3270bf]" aria-hidden="true" /><Input id={id} name={id} type={type} placeholder={placeholder} value={value} onChange={(event) => onChange(event.target.value)} {...props} className="h-12 rounded-lg border-[#c7d5e7] bg-white pl-11 shadow-none focus-visible:border-[#3270bf] focus-visible:ring-[#3270bf]/25" /></div></div>;
}
