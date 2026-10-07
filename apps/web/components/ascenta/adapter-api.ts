'use client';
import { reservationCreateInputSchema, type CatalogView, type LoginInput, type ReservationCreateInput, type SessionView } from '@ascenta/shared';
import type { Catalog, JourneyInput, Reservation, Runtime, User } from './types';

export class ApiError extends Error {
  constructor(public readonly code: string, message: string, public readonly status: number, public readonly fields?: Record<string, string>) { super(message); }
}
const apiBase = (process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:4000/api/v1').replace(/\/$/, '');
const csrfCookieName = process.env.NEXT_PUBLIC_CSRF_COOKIE_NAME ?? 'ascenta_csrf';
const csrfStorageKey = 'ascenta.csrf';

function csrfToken(): string {
  if (typeof document === 'undefined') return '';
  const cookie = document.cookie.split(';').map(item => item.trim()).find(item => item.startsWith(`${csrfCookieName}=`));
  // The latest cookie takes precedence when another tab has signed in again.
  if (cookie) return decodeURIComponent(cookie.slice(csrfCookieName.length + 1));
  try { return sessionStorage.getItem(csrfStorageKey) ?? ''; } catch { return ''; }
}
function errorFields(details: unknown): Record<string, string> | undefined {
  if (!details || typeof details !== 'object' || !('fieldErrors' in details) || !details.fieldErrors || typeof details.fieldErrors !== 'object') return undefined;
  const result: Record<string, string> = {};
  for (const [key, value] of Object.entries(details.fieldErrors)) {
    if (Array.isArray(value) && typeof value[0] === 'string') result[key] = value[0];
  }
  return result;
}
async function request<T>(endpoint: string, data?: unknown, protectedMutation = false): Promise<T> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (protectedMutation) {
    const token = csrfToken();
    if (!token) throw new ApiError('AUTH_REQUIRED', 'Please sign in again to verify your session.', 401);
    headers['X-CSRF-Token'] = token;
  }
  let response: Response;
  try {
    response = await fetch(`${apiBase}${endpoint}`, { credentials: 'include', headers, method: data === undefined ? 'GET' : 'POST', ...(data === undefined ? {} : { body: JSON.stringify(data) }) });
  } catch { throw new ApiError('NETWORK_ERROR', 'The server could not be reached. Please try again.', 0); }
  if (response.status === 204) return undefined as T;
  let body: unknown;
  try { body = await response.json(); }
  catch { throw new ApiError('RESPONSE_INVALID', 'The server response could not be read.', response.status); }
  if (!body || typeof body !== 'object') throw new ApiError('RESPONSE_INVALID', 'The server response is incomplete.', response.status);
  if (!response.ok || 'error' in body) {
    const error = 'error' in body && body.error && typeof body.error === 'object' ? body.error : {};
    throw new ApiError('code' in error && typeof error.code === 'string' ? error.code : 'REQUEST_FAILED', 'message' in error && typeof error.message === 'string' ? error.message : 'The request could not be completed.', response.status, errorFields('details' in error ? error.details : undefined));
  }
  if (!('data' in body)) throw new ApiError('RESPONSE_INVALID', 'The server response is incomplete.', response.status);
  return body.data as T;
}
function mapUser(user: SessionView['user'] & { organizationIds?: string[]; emailVerified?: boolean }): User {
  // Older API sessions omit this flag; login only succeeds after verification.
  return { ...user, emailVerified: user.emailVerified ?? true, organizations: (user.organizationIds ?? []).map(id => ({ id, name: id })) };
}
export function mapJourneyToReservation(input: JourneyInput): ReservationCreateInput {
  const details: string[] = [`Luggage / Equipaje: ${input.luggageCount}`];
  if (input.serviceTypeCode === 'ROUND_TRIP' && input.returnAt) details.push(`Requested return / Regreso solicitado: ${input.returnAt} (${input.scheduledTimeZone})`);
  if (input.serviceTypeCode === 'AIRPORT_TRANSFER') details.push(`Flight / Vuelo: ${input.flightDirection === 'DEPARTURE' ? 'Departure / Salida' : 'Arrival / Llegada'}${input.flightNumber ? `; ${input.flightNumber}` : ''}`);
  const notes = [input.notes?.trim(), details.join('\n')].filter(Boolean).join('\n\n');
  if (notes.length > 2000) throw new ApiError('VALIDATION_FAILED', 'Journey notes and additional details exceed 2000 characters.', 422, { notes: 'Reduce your notes; flight, luggage and return details must also fit within 2000 characters.' });
  const parsed = reservationCreateInputSchema.safeParse({ ...input, notes, durationHours: input.durationMinutes === undefined ? undefined : input.durationMinutes / 60 });
  if (!parsed.success) throw new ApiError('VALIDATION_FAILED', 'Check your journey details.', 422, errorFields(parsed.error.flatten()));
  return parsed.data;
}
type RegistrationInput = { email: string; displayName: string; password: string; termsAccepted?: boolean; acceptedNotice?: boolean };
type RegistrationResult = { status: 'verification_required'; localVerificationToken?: string; delivery: 'local_only' };
export function api(endpoint: '/catalog'): Promise<Catalog>;
export function api(endpoint: '/runtime'): Promise<Runtime>;
export function api(endpoint: '/auth/me'): Promise<{ user: User }>;
export function api(endpoint: '/auth/login', data: LoginInput): Promise<{ user: User }>;
export function api(endpoint: '/auth/register', data: RegistrationInput): Promise<RegistrationResult>;
export function api(endpoint: '/auth/verify-email', data: { token: string }): Promise<{ status: 'verified' }>;
export function api(endpoint: '/auth/logout', data: Record<string, never>): Promise<void>;
export function api(endpoint: '/requests'): Promise<Reservation[]>;
export function api(endpoint: '/requests', data: JourneyInput): Promise<Reservation>;
export function api(endpoint: '/operations/requests'): Promise<Reservation[]>;
export async function api(endpoint: string, data?: unknown): Promise<unknown> {
  if (endpoint === '/catalog') {
    const catalog = await request<CatalogView>('/catalog');
    return { serviceTypes: catalog.serviceTypes.map(item => ({ ...item, isActive: true })), vehicleClasses: catalog.vehicleClasses.map(item => ({ ...item, isActive: true, passengerLimit: item.passengerLimit ?? 0, luggageLimit: item.luggageLimit ?? 0 })) } satisfies Catalog;
  }
  if (endpoint === '/runtime') {
    const health = await request<{ status: string; dataMode: 'demo' | 'mysql' }>('/health');
    return { dataMode: health.dataMode, reviewMode: health.dataMode === 'demo', requestsEnabled: health.status === 'ok', manualOperations: false } satisfies Runtime;
  }
  if (endpoint === '/auth/me') { const result = await request<{ user: SessionView['user'] }>(endpoint); return { user: mapUser(result.user) }; }
  if (endpoint === '/auth/login') {
    const session = await request<SessionView>(endpoint, data);
    try { sessionStorage.setItem(csrfStorageKey, session.csrfToken); localStorage.setItem('ascenta.auth-event', String(Date.now())); } catch { /* The CSRF cookie remains available. */ }
    return { user: mapUser(session.user) };
  }
  if (endpoint === '/auth/register') { const input = data as RegistrationInput; return request<RegistrationResult>(endpoint, { email: input.email, displayName: input.displayName, password: input.password, termsAccepted: input.termsAccepted ?? input.acceptedNotice }); }
  if (endpoint === '/auth/verify-email') return request<{ status: 'verified' }>(endpoint, data);
  if (endpoint === '/auth/logout') { await request<void>(endpoint, {}, true); try { sessionStorage.removeItem(csrfStorageKey); } catch { /* optional storage */ } return; }
  if (endpoint === '/requests') return data === undefined ? request<Reservation[]>('/reservations') : request<Reservation>('/reservations', mapJourneyToReservation(data as JourneyInput), true);
  if (endpoint === '/operations/requests' && data === undefined) return request<Reservation[]>('/admin/reservations');
  throw new ApiError('FEATURE_UNAVAILABLE', 'This action is not available in the connected service.', 501);
}
