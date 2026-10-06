import type { ApiErrorPayload, ApiSuccess, CatalogView, LoginInput, RegisterInput, ReservationCreateInput, ReservationView, SessionView } from "@ascenta/shared";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000/api/v1";
const CSRF_COOKIE_NAME = process.env.NEXT_PUBLIC_CSRF_COOKIE_NAME ?? "ascenta_csrf";
const CSRF_STORAGE_KEY = "ascenta.csrf";

export class ApiClientError extends Error {
  constructor(public readonly code: string, message: string, public readonly status: number) {
    super(message);
  }
}

async function apiRequest<T>(path: string, init: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    credentials: "include",
    headers: { "content-type": "application/json", ...init.headers },
  });
  if (response.status === 204) return undefined as T;
  const body = await response.json() as ApiSuccess<T> | ApiErrorPayload;
  if (!response.ok || "error" in body) {
    const error = "error" in body ? body.error : { code: "REQUEST_FAILED", message: "The request could not be completed." };
    throw new ApiClientError(error.code, error.message, response.status);
  }
  return body.data;
}

export async function signIn(input: LoginInput) {
  const session = await apiRequest<SessionView>("/auth/login", { method: "POST", body: JSON.stringify(input) });
  sessionStorage.setItem(CSRF_STORAGE_KEY, session.csrfToken);
  return session;
}

export async function registerAccount(input: RegisterInput) {
  return apiRequest<{ status: "verification_required"; localVerificationToken?: string; delivery: "local_only" }>("/auth/register", { method: "POST", body: JSON.stringify(input) });
}

export async function verifyEmail(token: string) {
  return apiRequest<{ status: "verified" }>("/auth/verify-email", { method: "POST", body: JSON.stringify({ token }) });
}

export async function getCurrentSession() {
  return apiRequest<{ user: SessionView["user"] }>("/auth/me");
}

export async function createReservation(input: ReservationCreateInput) {
  const cookieToken = document.cookie.split("; ").find((entry) => entry.startsWith(`${CSRF_COOKIE_NAME}=`))?.split("=").slice(1).join("=");
  const csrfToken = sessionStorage.getItem(CSRF_STORAGE_KEY) ?? (cookieToken ? decodeURIComponent(cookieToken) : null);
  if (!csrfToken) throw new ApiClientError("AUTH_REQUIRED", "Please sign in before requesting your reservation.", 401);
  return apiRequest<ReservationView>("/reservations", { method: "POST", headers: { "x-csrf-token": csrfToken }, body: JSON.stringify(input) });
}

export async function getCatalog() {
  return apiRequest<CatalogView>("/catalog");
}

export async function getReservations() {
  return apiRequest<ReservationView[]>("/reservations");
}

export async function getOperationsReservations() {
  return apiRequest<ReservationView[]>("/admin/reservations");
}

export async function signOut() {
  const cookieToken = document.cookie.split("; ").find((entry) => entry.startsWith(`${CSRF_COOKIE_NAME}=`))?.split("=").slice(1).join("=");
  const csrfToken = sessionStorage.getItem(CSRF_STORAGE_KEY) ?? (cookieToken ? decodeURIComponent(cookieToken) : null);
  if (!csrfToken) throw new ApiClientError("AUTH_REQUIRED", "The current session could not be verified.", 401);
  await apiRequest<void>("/auth/logout", { method: "POST", headers: { "x-csrf-token": csrfToken } });
  sessionStorage.removeItem(CSRF_STORAGE_KEY);
}
