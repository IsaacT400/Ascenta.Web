export const JOURNEY_DRAFT_KEY = "ascenta.journey-draft.v1";
export const JOURNEY_DRAFT_TTL = 30 * 60 * 1000;

export type JourneyDraft = {
  version: 1;
  serviceTypeCode: "ONE_WAY" | "AIRPORT_TRANSFER" | "HOURLY" | "ROUND_TRIP" | "CITY_TO_CITY";
  pickupAddress: string;
  destinationAddress: string;
  pickupDate: string;
  pickupTime: string;
  durationHours: string;
  scheduledTimeZone: string;
  passengerCount: number;
  vehicleClassCode: "EXECUTIVE_SUV" | "PREMIUM_SUV" | "EXECUTIVE_VAN";
  passengerName: string;
  passengerEmail: string;
  notes: string;
  updatedAt: number;
  expiresAt: number;
  idempotencyKey: string;
};

export function emptyJourneyDraft(): JourneyDraft {
  const now = Date.now();
  return {
    version: 1,
    serviceTypeCode: "ONE_WAY",
    pickupAddress: "",
    destinationAddress: "",
    pickupDate: "",
    pickupTime: "",
    durationHours: "",
    scheduledTimeZone: Intl.DateTimeFormat().resolvedOptions().timeZone || "America/New_York",
    passengerCount: 1,
    vehicleClassCode: "EXECUTIVE_SUV",
    passengerName: "",
    passengerEmail: "",
    notes: "",
    updatedAt: now,
    expiresAt: now + JOURNEY_DRAFT_TTL,
    idempotencyKey: crypto.randomUUID(),
  };
}

export function readJourneyDraft(): JourneyDraft | null {
  try {
    const serialized = localStorage.getItem(JOURNEY_DRAFT_KEY);
    return parseJourneyDraft(serialized);
  } catch {
    return null;
  }
}

export function parseJourneyDraft(serialized: string | null): JourneyDraft | null {
  try {
    if (!serialized || serialized.length > 12_000) return null;
    const value: unknown = JSON.parse(serialized);
    if (!value || typeof value !== "object") return null;
    const draft = value as Partial<JourneyDraft>;
    const services = ["ONE_WAY", "AIRPORT_TRANSFER", "HOURLY", "ROUND_TRIP", "CITY_TO_CITY"];
    const vehicles = ["EXECUTIVE_SUV", "PREMIUM_SUV", "EXECUTIVE_VAN"];
    if (draft.version !== 1 || !services.includes(draft.serviceTypeCode ?? "") || !vehicles.includes(draft.vehicleClassCode ?? "") ||
      typeof draft.updatedAt !== "number" || typeof draft.expiresAt !== "number" || draft.expiresAt < Date.now() ||
      typeof draft.pickupAddress !== "string" || typeof draft.destinationAddress !== "string" ||
      typeof draft.pickupDate !== "string" || typeof draft.pickupTime !== "string" ||
      (draft.durationHours !== undefined && typeof draft.durationHours !== "string") ||
      typeof draft.scheduledTimeZone !== "string" || typeof draft.passengerCount !== "number" || draft.passengerCount < 1 || draft.passengerCount > 50 ||
      typeof draft.passengerName !== "string" || typeof draft.passengerEmail !== "string" || typeof draft.notes !== "string" ||
      typeof draft.idempotencyKey !== "string" || draft.idempotencyKey.length < 8) return null;
    return { ...draft, durationHours: draft.durationHours ?? "" } as JourneyDraft;
  } catch {
    return null;
  }
}

export function saveJourneyDraft(draft: JourneyDraft): boolean {
  try {
    const now = Date.now();
    localStorage.setItem(JOURNEY_DRAFT_KEY, JSON.stringify({ ...draft, updatedAt: now, expiresAt: now + JOURNEY_DRAFT_TTL }));
    window.dispatchEvent(new Event("ascenta-journey-draft"));
    return true;
  } catch {
    return false;
  }
}

export function subscribeJourneyDraft(onChange: () => void) {
  window.addEventListener("storage", onChange);
  window.addEventListener("ascenta-journey-draft", onChange);
  return () => {
    window.removeEventListener("storage", onChange);
    window.removeEventListener("ascenta-journey-draft", onChange);
  };
}

export function getJourneyDraftSnapshot() {
  try { return localStorage.getItem(JOURNEY_DRAFT_KEY) ?? ""; } catch { return ""; }
}

export function getEmptyJourneyDraftSnapshot() { return ""; }

export function subscribeJourneyService(onChange: () => void) {
  window.addEventListener("popstate", onChange);
  return () => window.removeEventListener("popstate", onChange);
}

export function getJourneyServiceSnapshot() {
  return new URLSearchParams(window.location.search).get("service") ?? "";
}

export function getEmptyJourneyServiceSnapshot() { return ""; }

export function getJourneyVehicleSnapshot() {
  return new URLSearchParams(window.location.search).get("vehicle") ?? "";
}

export function getEmptyJourneyVehicleSnapshot() { return ""; }
