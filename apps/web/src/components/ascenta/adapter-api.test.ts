import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { registerInputSchema, reservationCreateInputSchema } from '@ascenta/shared';
import { mapJourneyToReservation } from './adapter-api';
import type { JourneyInput } from './types';

const journey: JourneyInput = {
  serviceTypeCode: 'ONE_WAY',
  vehicleClassCode: 'EXECUTIVE_SUV',
  pickupAddress: 'JFK Terminal 4',
  destinationAddress: 'Midtown Manhattan',
  scheduledAt: '2030-07-01T10:30:00-04:00',
  scheduledTimeZone: 'America/New_York',
  passengerCount: 2,
  luggageCount: 3,
  passengerName: 'Test Passenger',
  passengerEmail: 'passenger@example.test',
  passengerPhone: '+12025550123',
  idempotencyKey: 'journey-test-request-001',
  acknowledgedRequest: true,
};

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date('2026-10-06T12:00:00Z'));
});
afterEach(() => vi.useRealTimers());

describe('HTML journey to Express reservation contract', () => {
  it('converts a 90-minute hourly request to 1.5 hours without inventing a destination', () => {
    const result = mapJourneyToReservation({ ...journey, serviceTypeCode: 'HOURLY', durationMinutes: 90, destinationAddress: '' });
    expect(result.durationHours).toBe(1.5);
    expect(result.destinationAddress).toBe('');
    expect(result).not.toHaveProperty('durationMinutes');
    expect(reservationCreateInputSchema.safeParse(result).success).toBe(true);
  });

  it('keeps passenger contact, route, time zone and the request key', () => {
    const result = mapJourneyToReservation(journey);
    expect(result).toMatchObject({
      passengerName: journey.passengerName,
      passengerEmail: journey.passengerEmail,
      passengerPhone: journey.passengerPhone,
      pickupAddress: journey.pickupAddress,
      destinationAddress: journey.destinationAddress,
      scheduledAt: journey.scheduledAt,
      scheduledTimeZone: journey.scheduledTimeZone,
      idempotencyKey: journey.idempotencyKey,
    });
    expect(result.durationHours).toBeUndefined();
  });

  it('retains passenger instructions and luggage in the persisted notes', () => {
    const result = mapJourneyToReservation({ ...journey, notes: 'Meet at the arrivals hall.' });
    expect(result.notes).toContain('Meet at the arrivals hall.');
    expect(result.notes).toContain('Luggage / Equipaje: 3');
    expect(result).not.toHaveProperty('luggageCount');
  });

  it.each([
    ['ARRIVAL', 'Arrival / Llegada'],
    ['DEPARTURE', 'Departure / Salida'],
  ])('preserves flight number and %s direction in persisted notes', (flightDirection, description) => {
    const result = mapJourneyToReservation({ ...journey, serviceTypeCode: 'AIRPORT_TRANSFER', flightDirection, flightNumber: 'AA123' });
    expect(result.notes).toContain(description);
    expect(result.notes).toContain('AA123');
    expect(result.notes).toContain('Luggage / Equipaje: 3');
  });

  it('preserves the full round-trip return timestamp and pickup time zone', () => {
    const returnAt = '2030-07-03T18:45:00-04:00';
    const result = mapJourneyToReservation({ ...journey, serviceTypeCode: 'ROUND_TRIP', returnAt });
    expect(result.notes).toContain(`Requested return / Regreso solicitado: ${returnAt} (America/New_York)`);
    expect(result.notes).toContain('Luggage / Equipaje: 3');
  });

  it('includes the additional details in the 2,000-character storage limit', () => {
    const detailLength = 'Luggage / Equipaje: 3'.length;
    const notesAtLimit = 'x'.repeat(2000 - detailLength - 2);
    expect(mapJourneyToReservation({ ...journey, notes: notesAtLimit }).notes).toHaveLength(2000);
    expect(() => mapJourneyToReservation({ ...journey, notes: `${notesAtLimit}x` })).toThrowError(
      expect.objectContaining({ code: 'VALIDATION_FAILED', status: 422, fields: { notes: expect.any(String) } }),
    );
    expect(() => mapJourneyToReservation({ ...journey, notes: 'x'.repeat(2001) })).toThrowError(
      expect.objectContaining({ code: 'VALIDATION_FAILED', status: 422 }),
    );
  });

  it('rejects invalid API payloads before sending a request', () => {
    expect(() => mapJourneyToReservation({ ...journey, serviceTypeCode: 'HOURLY', durationMinutes: undefined })).toThrowError(
      expect.objectContaining({ code: 'VALIDATION_FAILED', fields: { durationHours: expect.any(String) } }),
    );
    expect(() => mapJourneyToReservation({ ...journey, scheduledAt: '2020-01-01T10:30:00-05:00' })).toThrowError(
      expect.objectContaining({ code: 'VALIDATION_FAILED' }),
    );
  });
});

describe('shared schemas reject mass assignment', () => {
  it('strips injected reservation status, pricing, creator and roles in the adapter', () => {
    const untrustedInput = {
      ...journey,
      status: 'CONFIRMED',
      roles: ['ASCENTA_ADMIN'],
      totalMinor: 1,
      createdById: 'another-account',
    };
    const result = mapJourneyToReservation(untrustedInput);
    expect(result).not.toHaveProperty('status');
    expect(result).not.toHaveProperty('roles');
    expect(result).not.toHaveProperty('totalMinor');
    expect(result).not.toHaveProperty('createdById');
    expect(result).not.toHaveProperty('acknowledgedRequest');
  });

  it('strips account roles and verification flags from registration input', () => {
    const result = registerInputSchema.parse({
      displayName: 'Test Account',
      email: 'test@example.test',
      password: 'test-password-long-enough',
      termsAccepted: true,
      roles: ['ASCENTA_ADMIN'],
      emailVerified: true,
      organizationIds: ['07f32ba5-e410-4ed7-b70e-b348348e52cc'],
    });
    expect(result).not.toHaveProperty('roles');
    expect(result).not.toHaveProperty('emailVerified');
    expect(result).not.toHaveProperty('organizationIds');
  });
});
