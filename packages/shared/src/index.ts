import { z } from "zod";

export const roleSchema = z.enum([
  "CUSTOMER",
  "CORPORATE_BOOKER",
  "CORPORATE_ADMIN",
  "ASCENTA_ADMIN",
]);
export type Role = z.infer<typeof roleSchema>;

export const loginInputSchema = z.object({
  email: z.string().trim().email().max(254),
  password: z.string().min(8).max(128),
});
export type LoginInput = z.infer<typeof loginInputSchema>;

export const reservationCreateInputSchema = z.object({
  serviceTypeCode: z.enum(["ONE_WAY", "AIRPORT_TRANSFER", "HOURLY", "ROUND_TRIP", "CITY_TO_CITY"]),
  vehicleClassCode: z.enum(["EXECUTIVE_SUV", "PREMIUM_SUV", "EXECUTIVE_VAN"]),
  pickupAddress: z.string().trim().min(3).max(300),
  destinationAddress: z.string().trim().min(3).max(300),
  scheduledAt: z.string().datetime({ offset: true }),
  scheduledTimeZone: z.string().trim().min(3).max(64),
  passengerCount: z.number().int().min(1).max(50),
  notes: z.string().trim().max(2000).optional(),
  organizationId: z.string().uuid().optional(),
  idempotencyKey: z.string().trim().min(8).max(128),
});
export type ReservationCreateInput = z.infer<typeof reservationCreateInputSchema>;

export const reservationStatusSchema = z.enum([
  "DRAFT",
  "REQUESTED",
  "QUOTED",
  "CONFIRMED",
  "COMPLETED",
  "CANCELLED",
]);

export type ReservationView = {
  id: string;
  status: z.infer<typeof reservationStatusSchema>;
  serviceTypeCode: string;
  vehicleClassCode: string;
  pickupAddress: string;
  destinationAddress: string;
  scheduledAt: string;
  scheduledTimeZone: string;
  passengerCount: number;
  organizationId?: string;
  createdAt: string;
};

export type SessionView = {
  user: {
    id: string;
    email: string;
    displayName: string;
    roles: Role[];
  };
  csrfToken: string;
};

export type CatalogItem = {
  code: string;
  name: string;
  passengerLimit?: number;
  luggageLimit?: number;
};

export type CatalogView = {
  serviceTypes: CatalogItem[];
  vehicleClasses: CatalogItem[];
};

export type ApiErrorPayload = {
  error: {
    code: string;
    message: string;
    requestId: string;
    details?: unknown;
  };
};

export type ApiSuccess<T> = { data: T; requestId: string };
