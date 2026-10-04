import { describe, expect, it } from "vitest";
import { loginInputSchema, reservationCreateInputSchema } from "./index";

describe("shared API contracts", () => {
  it("rejects invalid login input", () => {
    expect(loginInputSchema.safeParse({ email: "not-email", password: "short" }).success).toBe(false);
  });

  it("accepts an offset-aware reservation time", () => {
    const result = reservationCreateInputSchema.safeParse({
      serviceTypeCode: "AIRPORT_TRANSFER",
      vehicleClassCode: "EXECUTIVE_SUV",
      pickupAddress: "Boston Logan International Airport",
      destinationAddress: "Andover, MA",
      scheduledAt: "2026-10-20T10:30:00-04:00",
      scheduledTimeZone: "America/New_York",
      passengerCount: 2,
      idempotencyKey: "demo-reservation-001",
    });
    expect(result.success).toBe(true);
  });
});
