"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import { ArrowLeft, ArrowRight, CalendarDays, Check, Clock3, Luggage, MapPin, Users } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { createReservation, getCatalog } from "@/lib/api-client";
import { emptyJourneyDraft, getEmptyJourneyDraftSnapshot, getEmptyJourneyServiceSnapshot, getEmptyJourneyVehicleSnapshot, getJourneyDraftSnapshot, getJourneyServiceSnapshot, getJourneyVehicleSnapshot, JOURNEY_DRAFT_KEY, parseJourneyDraft, saveJourneyDraft, subscribeJourneyDraft, subscribeJourneyService, type JourneyDraft } from "@/lib/journey-draft";
import type { CatalogView, ReservationView } from "@ascenta/shared";

const stepNames = ["Journey details", "Vehicle preference", "Passenger", "Review request"];
const modeLabels: Record<JourneyDraft["serviceTypeCode"], string> = { ONE_WAY: "One way", AIRPORT_TRANSFER: "Airport transfer", HOURLY: "By the hour", ROUND_TRIP: "Round trip", CITY_TO_CITY: "City to city" };
const serviceOptions = Object.entries(modeLabels) as Array<[JourneyDraft["serviceTypeCode"], string]>;

export function BookingWizard() {
  const router = useRouter();
  const serialized = useSyncExternalStore(subscribeJourneyDraft, getJourneyDraftSnapshot, getEmptyJourneyDraftSnapshot);
  const serviceFromUrl = useSyncExternalStore(subscribeJourneyService, getJourneyServiceSnapshot, getEmptyJourneyServiceSnapshot);
  const vehicleFromUrl = useSyncExternalStore(subscribeJourneyService, getJourneyVehicleSnapshot, getEmptyJourneyVehicleSnapshot);
  const validService = serviceOptions.some(([code]) => code === serviceFromUrl) ? serviceFromUrl as JourneyDraft["serviceTypeCode"] : undefined;
  const validVehicle = ["EXECUTIVE_SUV", "PREMIUM_SUV", "EXECUTIVE_VAN"].includes(vehicleFromUrl) ? vehicleFromUrl as JourneyDraft["vehicleClassCode"] : undefined;
  const draft = useMemo(() => {
    const saved = parseJourneyDraft(serialized);
    if (!saved) return { ...emptyJourneyDraft(), ...(validService ? { serviceTypeCode: validService } : {}), ...(validVehicle ? { vehicleClassCode: validVehicle } : {}) };
    if ((validService && validService !== saved.serviceTypeCode) || (validVehicle && validVehicle !== saved.vehicleClassCode)) return { ...saved, ...(validService ? { serviceTypeCode: validService } : {}), ...(validVehicle ? { vehicleClassCode: validVehicle } : {}), idempotencyKey: crypto.randomUUID() };
    return saved;
  }, [serialized, validService, validVehicle]);
  const [step, setStep] = useState(1);
  const [catalog, setCatalog] = useState<CatalogView | null>(null);
  const [catalogError, setCatalogError] = useState(false);
  const [storageError, setStorageError] = useState(false);
  const [submitState, setSubmitState] = useState<"idle" | "submitting" | "saved" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [savedRequest, setSavedRequest] = useState<ReservationView | null>(null);

  useEffect(() => {
    void getCatalog().then(setCatalog).catch(() => setCatalogError(true));
  }, []);

  function update<K extends keyof JourneyDraft>(key: K, value: JourneyDraft[K]) {
    const changedService = key === "serviceTypeCode" && value !== draft.serviceTypeCode;
    const changedVehicle = key === "vehicleClassCode" && value !== draft.vehicleClassCode;
    const changedSelection = changedService || changedVehicle;
    if (changedSelection) router.replace("/booking");
    const next = { ...draft, [key]: value, updatedAt: Date.now(), idempotencyKey: submitState === "error" || changedSelection ? crypto.randomUUID() : draft.idempotencyKey };
    if (changedService) {
      next.destinationAddress = value === "HOURLY" ? "" : draft.destinationAddress;
      next.durationHours = value === "HOURLY" ? draft.durationHours : "";
    }
    if (!saveJourneyDraft(next)) setStorageError(true);
    else setStorageError(false);
  }

  const selectedVehicle = catalog?.vehicleClasses.find((vehicle) => vehicle.code === draft.vehicleClassCode);
  const canContinue = step === 1 ? Boolean(draft.pickupAddress.trim() && (draft.serviceTypeCode === "HOURLY" ? Number(draft.durationHours) > 0 : draft.destinationAddress.trim()) && draft.pickupDate && draft.pickupTime) : step === 2 ? Boolean(selectedVehicle) : step === 3 ? Boolean(draft.passengerName.trim() && draft.passengerEmail.trim()) : true;

  async function submit() {
    if (submitState === "submitting" || !selectedVehicle) return;
    setSubmitState("submitting"); setErrorMessage("");
    if (!saveJourneyDraft(draft)) { setSubmitState("error"); setErrorMessage("The request could not be safely retried because browser storage is unavailable."); return; }
    const localDateTime = new Date(`${draft.pickupDate}T${draft.pickupTime}:00`);
    if (!Number.isFinite(localDateTime.getTime()) || localDateTime.getTime() <= Date.now() || (draft.serviceTypeCode === "HOURLY" && (!Number.isFinite(Number(draft.durationHours)) || Number(draft.durationHours) <= 0))) {
      setSubmitState("error"); setErrorMessage("Choose a future pickup date and time."); return;
    }
    try {
      const result = await createReservation({
        serviceTypeCode: draft.serviceTypeCode,
        vehicleClassCode: draft.vehicleClassCode,
        pickupAddress: draft.pickupAddress.trim(),
        destinationAddress: draft.serviceTypeCode === "HOURLY" ? undefined : draft.destinationAddress.trim(),
        durationHours: draft.serviceTypeCode === "HOURLY" ? Number(draft.durationHours) : undefined,
        scheduledAt: localDateTime.toISOString(),
        scheduledTimeZone: draft.scheduledTimeZone,
        passengerCount: draft.passengerCount,
        passengerName: draft.passengerName.trim(),
        passengerEmail: draft.passengerEmail.trim(),
        notes: draft.notes.trim() || undefined,
        idempotencyKey: draft.idempotencyKey,
      });
      setSavedRequest(result); setSubmitState("saved");
      try { localStorage.removeItem(JOURNEY_DRAFT_KEY); window.dispatchEvent(new Event("ascenta-journey-draft")); } catch { /* request is safely saved on the server */ }
    } catch (error) {
      setSubmitState("error");
      setErrorMessage(error instanceof Error ? error.message : "We could not confirm whether the request was saved. Retry to check the same request.");
    }
  }

  if (submitState === "saved" && savedRequest) return <section aria-live="polite" className="mx-auto max-w-3xl rounded-2xl border border-[#bfd9c7] bg-white p-7 shadow-sm sm:p-10">
    <span className="grid size-12 place-items-center rounded-full bg-[#e9f6ed] text-[#24633b]"><Check className="size-6" /></span>
    <p className="eyebrow mt-6 text-[#3270bf]">Request received</p><h2 className="mt-2 font-display text-3xl text-[#001030]">Your request is with the team.</h2>
    <p className="mt-3 text-sm leading-6 text-[#42536b]">Reference <strong>{savedRequest.reference}</strong> · status: {savedRequest.status}. This is not a quote or booking confirmation.</p>
    <div className="mt-6 grid gap-4 rounded-xl bg-[#f7f9fd] p-5 sm:grid-cols-2"><Summary label="Pickup" value={savedRequest.pickupAddress} />{savedRequest.durationHours ? <Summary label="Requested duration" value={`${savedRequest.durationHours} hours`} /> : <Summary label="Destination" value={savedRequest.destinationAddress || "To be coordinated"} />}<Summary label="Date and local time" value={new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short", timeZone: savedRequest.scheduledTimeZone }).format(new Date(savedRequest.scheduledAt))} /><Summary label="Passenger" value={savedRequest.passengerName || "Account holder"} /></div>
    <Button asChild className="mt-6 rounded-lg bg-[#3270bf] text-white"><Link href="/dashboard">Go to your account <ArrowRight /></Link></Button>
  </section>;

  return <div className="grid min-w-0 gap-7 lg:grid-cols-[minmax(0,1fr)_290px]">
    <section className="min-w-0 rounded-2xl border border-[#d5dfec] bg-white p-5 shadow-[0_20px_70px_rgba(0,16,48,.06)] sm:p-8">
      <div className="flex flex-wrap items-start justify-between gap-4"><div><p className="eyebrow text-[#3270bf]">Step {step} of 4</p><h2 className="mt-2 font-display text-3xl tracking-[-.03em] text-[#001030]">{stepNames[step - 1]}</h2></div><Badge variant="outline" className="border-[#a9c9ef] bg-[#f0f6fd] text-[#244f88]">Request for review</Badge></div>
      <Progress value={step * 25} className="mt-6 h-1.5 bg-[#e8eef7] [&>div]:bg-[#3270bf]" />
      <div className="mt-8 min-h-[340px]">
        {step === 1 && <div><Tabs value={draft.serviceTypeCode} onValueChange={(value) => update("serviceTypeCode", value as JourneyDraft["serviceTypeCode"])}><TabsList aria-label="Journey type" className="mb-5 h-auto w-full justify-start gap-1 overflow-x-auto bg-transparent p-0">{serviceOptions.map(([code, label]) => <TabsTrigger key={code} value={code} className="min-h-10 shrink-0 rounded-full border border-[#d5dfec] px-3 text-xs data-[state=active]:border-[#3270bf] data-[state=active]:bg-[#3270bf] data-[state=active]:text-white">{label}</TabsTrigger>)}</TabsList></Tabs><div className="grid gap-4 sm:grid-cols-2">
          <Field id="pickup" label="Pickup" value={draft.pickupAddress} onChange={(value) => update("pickupAddress", value)} icon={MapPin} placeholder="Address, airport or hotel" required />
          {draft.serviceTypeCode === "HOURLY" ? <Field id="duration" label="Requested duration (hours)" value={draft.durationHours} onChange={(value) => update("durationHours", value)} icon={Clock3} type="number" step="any" placeholder="Enter hours" required /> : <Field id="destination" label="Destination" value={draft.destinationAddress} onChange={(value) => update("destinationAddress", value)} icon={MapPin} placeholder="Address or city" required />}
          <Field id="pickup-date" label="Pickup date" value={draft.pickupDate} onChange={(value) => update("pickupDate", value)} icon={CalendarDays} type="date" min={new Date().toLocaleDateString("en-CA")} required />
          <Field id="pickup-time" label="Local pickup time" value={draft.pickupTime} onChange={(value) => update("pickupTime", value)} icon={Clock3} type="time" required />
          <Field id="passengers" label="Passengers" value={String(draft.passengerCount)} onChange={(value) => update("passengerCount", Math.max(1, Math.min(50, Number(value) || 1)))} icon={Users} type="number" min="1" max="50" required />
          <p className="self-center text-xs leading-5 text-[#53627a]">Time zone: {draft.scheduledTimeZone}. Place names are entered manually; no geocoding or coverage check is active.</p>
          {draft.serviceTypeCode === "HOURLY" && <p className="sm:col-span-2 rounded-lg bg-[#f0f6fd] p-3 text-sm text-[#244f88]">Requested duration is saved for review. No hourly rate or minimum duration is assumed.</p>}
        </div></div>}
        {step === 2 && <div>
          <h3 className="font-semibold text-[#001030]">Choose a preferred category</h3>
          {catalogError && <div role="alert" className="mt-4 rounded-lg bg-red-50 p-4 text-sm text-red-800">Vehicle categories could not be loaded from the API. <button type="button" className="font-semibold underline" onClick={() => { setCatalogError(false); void getCatalog().then(setCatalog).catch(() => setCatalogError(true)); }}>Retry</button></div>}
          {!catalog && !catalogError && <p className="mt-4 text-sm text-[#53627a]">Loading current categories…</p>}
          <div className="mt-4 grid gap-3">{catalog?.vehicleClasses.map((vehicle) => <button key={vehicle.code} type="button" onClick={() => update("vehicleClassCode", vehicle.code as JourneyDraft["vehicleClassCode"])} aria-pressed={draft.vehicleClassCode === vehicle.code} className={`flex min-h-20 items-center gap-4 rounded-xl border p-4 text-left transition-colors ${draft.vehicleClassCode === vehicle.code ? "border-[#3270bf] bg-[#f0f6fd] ring-2 ring-[#3270bf]/15" : "border-[#d5dfec] hover:border-[#92bef2]"}`}><span className={`grid size-9 shrink-0 place-items-center rounded-full ${draft.vehicleClassCode === vehicle.code ? "bg-[#3270bf] text-white" : "bg-[#e8eef7] text-[#40536f]"}`}>{draft.vehicleClassCode === vehicle.code ? <Check className="size-4" /> : <Luggage className="size-4" />}</span><span className="flex-1"><span className="block font-semibold text-[#001030]">{vehicle.name}</span><span className="mt-1 block text-xs text-[#53627a]">Preference only. Availability is reviewed by the team.</span></span><span className="text-xs text-[#53627a]">{vehicle.passengerLimit ?? "—"} seats · {vehicle.luggageLimit ?? "—"} bags listed</span></button>)}</div>
          <p className="mt-4 text-xs leading-5 text-[#53627a]">Catalog capacities describe listed categories and do not confirm a vehicle for your date.</p>
        </div>}
        {step === 3 && <div className="grid gap-4 sm:grid-cols-2">
          <Field id="passenger-name" label="Passenger name" value={draft.passengerName} onChange={(value) => update("passengerName", value)} icon={Users} placeholder="Person taking the journey" autoComplete="name" required />
          <Field id="passenger-email" label="Passenger email" value={draft.passengerEmail} onChange={(value) => update("passengerEmail", value)} icon={Users} type="email" placeholder="name@example.com" autoComplete="email" required />
          <div className="sm:col-span-2"><Label htmlFor="trip-notes" className="mb-2 block text-sm font-semibold text-[#42536b]">Trip notes <span className="font-normal">(optional)</span></Label><textarea id="trip-notes" value={draft.notes} maxLength={2000} onChange={(event) => update("notes", event.target.value)} rows={4} className="w-full rounded-lg border border-[#c7d5e7] p-3 text-sm outline-none focus:border-[#3270bf] focus:ring-2 focus:ring-[#3270bf]/20" placeholder="Details the team should consider" /></div>
          <p className="sm:col-span-2 flex items-start gap-2 text-xs leading-5 text-[#53627a]"><input type="checkbox" checked readOnly aria-label="The account holder will receive this request" className="mt-0.5 accent-[#3270bf]" />The signed-in account is the requester. Passenger details can be different.</p>
        </div>}
        {step === 4 && <div className="rounded-xl border border-[#d5dfec] bg-[#f7f9fd] p-5 sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3"><div><p className="eyebrow text-[#3270bf]">Request summary</p><h3 className="mt-2 font-display text-2xl text-[#001030]">{modeLabels[draft.serviceTypeCode]}</h3></div><Button type="button" variant="outline" className="rounded-lg bg-white" onClick={() => setStep(1)}>Edit journey</Button></div>
          <div className="mt-6 grid gap-5 sm:grid-cols-2"><Summary label="Pickup" value={draft.pickupAddress} />{draft.serviceTypeCode === "HOURLY" ? <Summary label="Requested duration" value={`${draft.durationHours} hours`} /> : <Summary label="Destination" value={draft.destinationAddress} />}<Summary label="Date and time" value={`${draft.pickupDate} · ${draft.pickupTime} (${draft.scheduledTimeZone})`} /><Summary label="Passengers" value={String(draft.passengerCount)} /><Summary label="Preferred category" value={selectedVehicle?.name ?? "Loading catalog"} /><Summary label="Passenger" value={`${draft.passengerName} · ${draft.passengerEmail}`} /></div>
          {draft.notes && <div className="mt-5"><Summary label="Trip notes" value={draft.notes} /></div>}
          <p className="mt-6 border-t border-[#d5dfec] pt-4 text-sm leading-6 text-[#42536b]">Submitting sends a request for operational review. It does not reserve a vehicle, confirm availability, or create a price.</p>
        </div>}
      </div>
      {storageError && <p role="alert" className="mt-4 text-sm text-red-700">The draft could not be saved in this browser. Do not leave this page until storage is available.</p>}
      {submitState === "error" && <div role="alert" className="mt-4 rounded-lg border border-red-200 bg-red-50 p-4 text-sm leading-6 text-red-800">{errorMessage}{errorMessage.includes("sign in") && <Link className="ml-1 font-semibold underline" href={`/login?next=${encodeURIComponent("/booking")}`}>Sign in or create an account</Link>}</div>}
      <div className="mt-8 flex items-center justify-between border-t border-[#e2e9f2] pt-6">
        <Button type="button" variant="ghost" onClick={() => setStep((current) => Math.max(1, current - 1))} disabled={step === 1} className="rounded-full text-[#34435c]"><ArrowLeft /> Back</Button>
        {step < 4 ? <Button type="button" onClick={() => setStep((current) => Math.min(4, current + 1))} disabled={!canContinue || (step === 2 && (!catalog || catalogError))} className="h-11 rounded-lg bg-[#3270bf] px-6 text-white">Continue <ArrowRight /></Button> : <Button type="button" onClick={() => void submit()} disabled={submitState === "submitting" || !canContinue || storageError} className="h-11 rounded-lg bg-[#3270bf] px-6 text-white">{submitState === "submitting" ? "Sending request…" : "Send request"} <ArrowRight /></Button>}
      </div>
    </section>
    <aside className="h-fit rounded-2xl bg-[#001030] p-6 text-white lg:sticky lg:top-24">
      <p className="eyebrow text-[#92bef2]">Your journey</p><div className="mt-6">{stepNames.map((label, index) => <div key={label} className="flex gap-3"><div className="flex flex-col items-center"><span className={`grid size-8 place-items-center rounded-full border text-xs font-bold ${step > index + 1 ? "border-[#92bef2] bg-[#92bef2] text-[#001030]" : step === index + 1 ? "border-white bg-white text-[#001030]" : "border-white/25 text-white/60"}`}>{step > index + 1 ? <Check className="size-4" /> : index + 1}</span>{index < 3 && <span className="h-8 w-px bg-white/20" />}</div><span className={`pt-1.5 text-sm ${step === index + 1 ? "font-semibold text-white" : "text-white/60"}`}>{label}</span></div>)}</div>
      <div className="mt-6 border-t border-white/15 pt-4 text-xs leading-5 text-white/70">Your browser draft stays available for 30 minutes of inactivity. No prices or availability are shown.</div>
    </aside>
  </div>;
}

function Field({ id, label, value, onChange, icon: Icon, ...props }: { id: string; label: string; value: string; onChange: (value: string) => void; icon: typeof MapPin; type?: string; step?: string; placeholder?: string; min?: string; max?: string; required?: boolean; autoComplete?: string }) {
  return <div><Label htmlFor={id} className="mb-2 block text-sm font-semibold text-[#42536b]">{label}</Label><div className="relative"><Icon className="absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-[#3270bf]" aria-hidden="true" /><Input id={id} value={value} onChange={(event) => onChange(event.target.value)} {...props} className="h-12 rounded-lg border-[#c7d5e7] pl-10 shadow-none focus-visible:border-[#3270bf] focus-visible:ring-[#3270bf]/20" /></div></div>;
}
function Summary({ label, value }: { label: string; value: string }) { return <div><p className="text-xs font-semibold text-[#60708a]">{label}</p><p className="mt-1 break-words text-sm font-medium text-[#001030]">{value}</p></div>; }
