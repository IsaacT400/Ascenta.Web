import type { Catalog, JourneyInput } from './types';

export class PlatformError extends Error {
  constructor(public status: number, public code: string, message: string, public fields?: Record<string, string>) {
    super(message); this.name = 'PlatformError';
  }
}

export const SERVICE_CODES = ['ONE_WAY', 'AIRPORT_TRANSFER', 'HOURLY', 'ROUND_TRIP', 'CITY_TO_CITY'];

export const DRAFT_TTL_MS = 30 * 60 * 1000;

export const DRAFT_STORAGE_KEY = 'ascenta.journey.v1';

export const DEFAULT_ZONE = 'America/New_York';

export function isTimeZone(value: string) {
    try {
        new Intl.DateTimeFormat('en-US', { timeZone: value }).format(0);
        return value.length <= 64;
    }
    catch {
        return false;
    }
}

export function partsAt(epoch: number, zone: string) {
    const parts = new Intl.DateTimeFormat('en-CA', { timeZone: zone, year: 'numeric', month: '2-digit',
        day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23' }).formatToParts(epoch);
    return Object.fromEntries(parts.map(p => [p.type, p.value]));
}

export function localAt(instant: string | number, zone: string) {
    const p = partsAt(typeof instant === 'string' ? Date.parse(instant) : instant, zone);
    return `${p.year}-${p.month}-${p.day}T${p.hour}:${p.minute}`;
}

export function offsetAt(epoch: number, zone: string) {
    const p = partsAt(epoch, zone);
    return (Date.UTC(+p.year, +p.month - 1, +p.day, +p.hour, +p.minute, +p.second) - Math.floor(epoch / 1000) * 1000) / 60000;
}

/** All possible instants for a wall-clock minute. Zero = DST gap; two = repeated hour. */
export function possibleInstants(local: string, zone: string): string[] {
    if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(local) || !isTimeZone(zone))
        return [];
    const wall = Date.parse(`${local}:00Z`);
    if (!Number.isFinite(wall) || new Date(wall).toISOString().slice(0, 16) !== local)
        return [];
    const offsets = new Set<number>();
    for (let hours = -36; hours <= 36; hours += 6)
        offsets.add(offsetAt(wall + hours * 3600000, zone));
    return [...offsets].map(offset => wall - offset * 60000)
        .filter(epoch => localAt(epoch, zone) === local).sort((a, b) => a - b)
        .map(epoch => {
        const offset = offsetAt(epoch, zone);
        const absolute = Math.abs(offset);
        return `${local}:00${offset < 0 ? '-' : '+'}${String(Math.floor(absolute / 60)).padStart(2, '0')}:${String(absolute % 60).padStart(2, '0')}`;
    });
}

export function toInstant(local: string, zone: string, occurrence?: number) {
    const options = possibleInstants(local, zone);
    if (!options.length)
        throw new PlatformError(422, 'TIME_INVALID', 'This local time does not exist in the selected time zone.');
    if (options.length > 1 && occurrence === undefined)
        throw new PlatformError(422, 'TIME_AMBIGUOUS', 'Choose the first or second occurrence of this local time.');
    return options[occurrence ?? 0] ?? options[0];
}

export function validateInstant(value: unknown, zone: string, now: number) {
    if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,3})?(?:Z|[+-]\d{2}:\d{2})$/.test(value) || !isTimeZone(zone))
        return false;
    const epoch = Date.parse(value);
    if (!Number.isFinite(epoch) || epoch <= now)
        return false;
    const suffix = value.match(/([+-])(\d{2}):(\d{2})$/);
    const claimedOffset = suffix ? (suffix[1] === '-' ? -1 : 1) * (+suffix[2] * 60 + +suffix[3]) : 0;
    return claimedOffset === offsetAt(epoch, zone) && localAt(epoch, zone) === value.slice(0, 16);
}

const text = (value: unknown) => typeof value === 'string' ? value.trim() : '';

export function isEmail(value: string) { return value.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value); }

export function isPhone(value: string) { return /^\+[1-9]\d{7,14}$/.test(value.replace(/[ ()-]/g, '')); }

export function validatePassword(value: unknown) {
    if (typeof value !== 'string' || value.length < 12 || value.length > 128)
        throw new PlatformError(422, 'PASSWORD_INVALID', 'Use a password with 12–128 characters.', { password: 'Use 12–128 characters.' });
    return value;
}

export function safeReturn(value?: string | null) {
    if (!value || !value.startsWith('/') || value.startsWith('//') || /[\\\r\n]/.test(value))
        return '/dashboard';
    try {
        const url = new URL(value, 'https://ascenta.invalid');
        return ['/booking', '/dashboard', '/account', '/corporate', '/corporate/usage', '/admin'].includes(url.pathname) && url.origin === 'https://ascenta.invalid' ? url.pathname : '/dashboard';
    }
    catch {
        return '/dashboard';
    }
}

/** Picks fields explicitly: no mass-assignment of roles, prices, status or creator. */
export function normalizeJourney(raw: Record<string, unknown>): JourneyInput {
    return {
        serviceTypeCode: text(raw.serviceTypeCode), vehicleClassCode: text(raw.vehicleClassCode),
        pickupAddress: text(raw.pickupAddress), destinationAddress: text(raw.destinationAddress),
        scheduledAt: text(raw.scheduledAt), scheduledTimeZone: text(raw.scheduledTimeZone),
        passengerCount: typeof raw.passengerCount === 'number' ? raw.passengerCount : NaN,
        luggageCount: typeof raw.luggageCount === 'number' ? raw.luggageCount : NaN,
        durationMinutes: raw.durationMinutes == null ? undefined : typeof raw.durationMinutes === 'number' ? raw.durationMinutes : NaN,
        returnAt: text(raw.returnAt) || undefined, flightNumber: text(raw.flightNumber).toUpperCase() || undefined,
        flightDirection: text(raw.flightDirection) || undefined,
        passengerName: text(raw.passengerName), passengerEmail: text(raw.passengerEmail).toLowerCase() || undefined,
        passengerPhone: text(raw.passengerPhone).replace(/[ ()-]/g, ''),
        notes: text(raw.notes) || undefined, organizationId: text(raw.organizationId) || undefined,
        idempotencyKey: text(raw.idempotencyKey), acknowledgedRequest: raw.acknowledgedRequest === true,
    };
}

export function validateJourney(input: JourneyInput, catalog: Catalog, now = Date.now()) {
    const fields: Record<string, string> = {};
    if (!SERVICE_CODES.includes(input.serviceTypeCode) || !catalog.serviceTypes.some(s => s.code === input.serviceTypeCode && s.isActive))
        fields.serviceTypeCode = 'Choose an available journey type.';
    const vehicle = catalog.vehicleClasses.find(v => v.code === input.vehicleClassCode && v.isActive);
    if (!vehicle)
        fields.vehicleClassCode = 'Choose an available vehicle preference.';
    if (input.pickupAddress.length < 3 || input.pickupAddress.length > 300)
        fields.pickupAddress = 'Enter a pickup address (3–300 characters).';
    if (input.serviceTypeCode !== 'HOURLY' && (input.destinationAddress.length < 3 || input.destinationAddress.length > 300))
        fields.destinationAddress = 'Enter a destination (3–300 characters).';
    if (input.destinationAddress.length > 300)
        fields.destinationAddress = 'Use at most 300 characters.';
    if (!validateInstant(input.scheduledAt, input.scheduledTimeZone, now))
        fields.scheduledAt = 'Choose a future date/time with a matching time zone.';
    if (!Number.isInteger(input.passengerCount) || input.passengerCount < 1 || input.passengerCount > (vehicle?.passengerLimit ?? 50))
        fields.passengerCount = 'The passenger count is outside the selected category limit.';
    if (!Number.isInteger(input.luggageCount) || input.luggageCount < 0 || input.luggageCount > (vehicle?.luggageLimit ?? 50))
        fields.luggageCount = 'The luggage count is outside the selected category limit.';
    if (input.serviceTypeCode === 'HOURLY' && (input.durationMinutes === undefined || !Number.isInteger(input.durationMinutes) || input.durationMinutes < 60 || input.durationMinutes > 1440 || input.durationMinutes % 30 !== 0))
        fields.durationMinutes = 'Enter a requested duration from 1 to 24 hours, in half-hour steps.';
    if (input.serviceTypeCode !== 'HOURLY' && input.durationMinutes !== undefined)
        fields.durationMinutes = 'Duration only applies to hourly requests.';
    if (input.serviceTypeCode === 'ROUND_TRIP' && (!input.returnAt || !validateInstant(input.returnAt, input.scheduledTimeZone, Date.parse(input.scheduledAt))))
        fields.returnAt = 'The return must be later than the outbound journey, with the same time zone.';
    if (input.serviceTypeCode !== 'ROUND_TRIP' && input.returnAt)
        fields.returnAt = 'A return time requires round-trip mode.';
    if (input.serviceTypeCode === 'AIRPORT_TRANSFER' && !['ARRIVAL', 'DEPARTURE'].includes(input.flightDirection ?? ''))
        fields.flightDirection = 'Choose arrival or departure.';
    if ((input.flightNumber?.length ?? 0) > 24)
        fields.flightNumber = 'Use at most 24 characters.';
    if (input.passengerName.length < 2 || input.passengerName.length > 160)
        fields.passengerName = 'Enter the passenger name (2–160 characters).';
    if (!isPhone(input.passengerPhone))
        fields.passengerPhone = 'Use an international phone number, starting with + and country code.';
    if (input.passengerEmail && !isEmail(input.passengerEmail))
        fields.passengerEmail = 'Enter a valid email address.';
    if ((input.notes?.length ?? 0) > 2000)
        fields.notes = 'Use at most 2,000 characters.';
    if (!/^[A-Za-z0-9_-]{16,128}$/.test(input.idempotencyKey))
        fields.idempotencyKey = 'A valid request key is required.';
    if (input.organizationId && !/^[0-9a-f-]{36}$/i.test(input.organizationId))
        fields.organizationId = 'Invalid organization.';
    if (!input.acknowledgedRequest)
        fields.acknowledgedRequest = 'Acknowledge that this is a request, not a confirmed ride.';
    if (Object.keys(fields).length)
        throw new PlatformError(422, 'VALIDATION_FAILED', 'Review the highlighted fields.', fields);
    return input;
}

export function canonicalJourney(input: JourneyInput) {
    const values = Object.fromEntries(Object.entries(input).filter(([key]) => key !== 'idempotencyKey'));
    return JSON.stringify(Object.fromEntries(Object.entries(values).filter(([, value]) => value !== undefined).sort(([a], [b]) => a.localeCompare(b))));
}

export function minorAmount(value: string) {
    if (!/^\d{1,7}(?:\.\d{1,2})?$/.test(value))
        throw new PlatformError(422, 'AMOUNT_INVALID', 'Enter a non-negative amount with at most two decimals.');
    const [whole, fraction = ''] = value.split('.');
    return Number(whole) * 100 + Number(fraction.padEnd(2, '0'));
}