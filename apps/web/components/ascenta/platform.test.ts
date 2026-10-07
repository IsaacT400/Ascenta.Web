import { describe, expect, it } from 'vitest';
import { normalizeJourney, possibleInstants, safeReturn, toInstant, validateInstant } from './platform';

describe('pickup time zones', () => {
  it('rejects the missing New York spring-forward hour', () => {
    expect(possibleInstants('2026-03-08T02:30', 'America/New_York')).toEqual([]);
    expect(() => toInstant('2026-03-08T02:30', 'America/New_York')).toThrowError(
      expect.objectContaining({ code: 'TIME_INVALID', status: 422 }),
    );
  });

  it('requires a choice between the two New York fall-back occurrences', () => {
    const first = '2026-11-01T01:30:00-04:00';
    const second = '2026-11-01T01:30:00-05:00';
    expect(possibleInstants('2026-11-01T01:30', 'America/New_York')).toEqual([first, second]);
    expect(() => toInstant('2026-11-01T01:30', 'America/New_York')).toThrowError(
      expect.objectContaining({ code: 'TIME_AMBIGUOUS', status: 422 }),
    );
    expect(toInstant('2026-11-01T01:30', 'America/New_York', 0)).toBe(first);
    expect(toInstant('2026-11-01T01:30', 'America/New_York', 1)).toBe(second);
    expect(Date.parse(second) - Date.parse(first)).toBe(60 * 60 * 1000);
  });

  it('handles half-hour offsets and rejects nonexistent calendar dates', () => {
    expect(possibleInstants('2026-10-06T09:15', 'Asia/Kolkata')).toEqual(['2026-10-06T09:15:00+05:30']);
    expect(possibleInstants('2026-02-30T09:15', 'America/New_York')).toEqual([]);
    expect(possibleInstants('2026-10-06T09:15', 'Invalid/TimeZone')).toEqual([]);
  });

  it('rejects offsets that do not match the pickup zone and dates that have passed', () => {
    const beforePickup = Date.parse('2026-10-06T00:00:00Z');
    expect(validateInstant('2026-11-01T01:30:00-04:00', 'America/New_York', beforePickup)).toBe(true);
    expect(validateInstant('2026-11-01T01:30:00-05:00', 'America/New_York', beforePickup)).toBe(true);
    expect(validateInstant('2026-11-01T01:30:00-03:00', 'America/New_York', beforePickup)).toBe(false);
    expect(validateInstant('2026-11-01T01:30:00', 'America/New_York', beforePickup)).toBe(false);
    expect(validateInstant('2026-10-05T12:00:00-04:00', 'America/New_York', beforePickup)).toBe(false);
  });
});

describe('sign-in return destination', () => {
  it.each([
    null,
    '',
    'https://evil.example/booking',
    '//evil.example/booking',
    '/\\evil.example/booking',
    '/booking\r\nLocation: https://evil.example',
    '/%2f%2fevil.example/booking',
    '/booking%0a',
    'javascript:alert(1)',
    '/unlisted-page',
  ])('uses the account page for unsafe or unsupported destination %j', destination => {
    expect(safeReturn(destination)).toBe('/dashboard');
  });

  it('keeps authorized internal paths and removes query strings and fragments', () => {
    expect(safeReturn('/booking')).toBe('/booking');
    expect(safeReturn('/corporate/usage')).toBe('/corporate/usage');
    expect(safeReturn('/account?next=https://evil.example#external')).toBe('/account');
  });
});

describe('journey field normalization', () => {
  it('excludes security-sensitive fields from untrusted browser input', () => {
    const result = normalizeJourney({
      serviceTypeCode: 'ONE_WAY',
      pickupAddress: '  JFK Terminal 4  ',
      passengerPhone: '+1 (202) 555-0123',
      status: 'CONFIRMED',
      roles: ['ASCENTA_ADMIN'],
      createdById: 'another-account',
      totalMinor: 1,
    });
    expect(result.pickupAddress).toBe('JFK Terminal 4');
    expect(result.passengerPhone).toBe('+12025550123');
    expect(result).not.toHaveProperty('status');
    expect(result).not.toHaveProperty('roles');
    expect(result).not.toHaveProperty('createdById');
    expect(result).not.toHaveProperty('totalMinor');
  });
});
