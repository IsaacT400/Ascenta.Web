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

export const registerInputSchema = z.object({
  email: z.string().trim().email().max(254),
  displayName: z.string().trim().min(2).max(160),
  password: z.string().min(12).max(128),
  termsAccepted: z.literal(true),
});
export type RegisterInput = z.infer<typeof registerInputSchema>;

export const reservationCreateInputSchema = z.object({
  serviceTypeCode: z.enum(["ONE_WAY", "AIRPORT_TRANSFER", "HOURLY", "ROUND_TRIP", "CITY_TO_CITY"]),
  vehicleClassCode: z.enum(["EXECUTIVE_SUV", "PREMIUM_SUV", "EXECUTIVE_VAN"]),
  pickupAddress: z.string().trim().min(3).max(300),
  destinationAddress: z.string().trim().max(300).optional(),
  durationHours: z.number().finite().positive().optional(),
  scheduledAt: z.string().datetime({ offset: true }),
  scheduledTimeZone: z.string().trim().min(3).max(64),
  passengerCount: z.number().int().min(1).max(50),
  passengerName: z.string().trim().min(2).max(160).optional(),
  passengerEmail: z.string().trim().email().max(254).optional(),
  passengerPhone: z.string().trim().min(7).max(32).optional(),
  notes: z.string().trim().max(2000).optional(),
  organizationId: z.string().uuid().optional(),
  idempotencyKey: z.string().trim().min(8).max(128),
}).superRefine((input, context) => {
  if (input.serviceTypeCode === "HOURLY") {
    if (input.durationHours === undefined) context.addIssue({ code: "custom", path: ["durationHours"], message: "Enter the requested hourly duration." });
  } else if (!input.destinationAddress || input.destinationAddress.length < 3) {
    context.addIssue({ code: "custom", path: ["destinationAddress"], message: "Enter a destination." });
  }
  if (Date.parse(input.scheduledAt) <= Date.now()) context.addIssue({ code: "custom", path: ["scheduledAt"], message: "Pickup time must be in the future." });
  try {
    new Intl.DateTimeFormat("en-US", { timeZone: input.scheduledTimeZone }).format(new Date(input.scheduledAt));
  } catch {
    context.addIssue({ code: "custom", path: ["scheduledTimeZone"], message: "Use a valid IANA time zone." });
  }
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
  reference: string;
  status: z.infer<typeof reservationStatusSchema>;
  serviceTypeCode: string;
  vehicleClassCode: string;
  pickupAddress: string;
  destinationAddress?: string;
  scheduledAt: string;
  scheduledTimeZone: string;
  passengerCount: number;
  durationHours?: number;
  passengerName?: string;
  passengerEmail?: string;
  passengerPhone?: string;
  notes?: string;
  requesterName?: string;
  requesterEmail?: string;
  organizationId?: string;
  createdAt: string;
};

export type SessionView = {
  user: {
    id: string;
    email: string;
    displayName: string;
    roles: Role[];
    organizationIds?: string[];
    emailVerified?: boolean;
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
