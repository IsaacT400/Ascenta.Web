import type { CatalogItem, ReservationView, SessionView } from '@ascenta/shared';

export type Language = 'en' | 'es';
export type Organization = { id: string; name: string };
export type User = SessionView['user'] & { emailVerified: boolean; organizationIds?: string[]; organizations: Organization[] };
export type Catalog = {
  illustrative?: boolean;
  serviceTypes: Array<CatalogItem & { isActive: boolean }>;
  vehicleClasses: Array<CatalogItem & { isActive: boolean; passengerLimit: number; luggageLimit: number }>;
};
export type Runtime = { dataMode: 'demo' | 'mysql'; reviewMode: boolean; requestsEnabled: boolean; manualOperations: boolean };
export type JourneyDraft = {
  serviceTypeCode: string; vehicleClassCode: string; pickupAddress: string; destinationAddress: string;
  date: string; time: string; zone: string; occurrence?: 0 | 1; returnDate: string; returnTime: string; returnOccurrence?: 0 | 1;
  passengers: number; luggage: number; hours: number; flightNumber: string; flightDirection: string;
  passengerName: string; passengerEmail: string; passengerPhone: string; notes: string; organizationId: string;
  key: string; createdAt: number; submissionUncertain: boolean;
};
export type JourneyInput = {
  serviceTypeCode: string; vehicleClassCode: string; pickupAddress: string; destinationAddress: string;
  scheduledAt: string; scheduledTimeZone: string; passengerCount: number; luggageCount: number;
  durationMinutes?: number; returnAt?: string; flightNumber?: string; flightDirection?: string;
  passengerName: string; passengerEmail?: string; passengerPhone: string; notes?: string;
  organizationId?: string; idempotencyKey: string; acknowledgedRequest: boolean;
};
export type Reservation = ReservationView & { notes?: string };
