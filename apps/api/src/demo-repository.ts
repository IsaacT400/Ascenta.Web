import { hashSync } from "bcryptjs";
import { randomUUID } from "node:crypto";

import type { CatalogView, ReservationCreateInput, ReservationView } from "@ascenta/shared";
import type { AscentaRepository, RepositorySession, RepositoryUser } from "./repository.js";

const demoPasswordHash = hashSync("AscentaDemo!2026", 10);

export class DemoRepository implements AscentaRepository {
  private readonly users: RepositoryUser[] = [
    { id: "20000000-0000-4000-8000-000000000001", email: "demo.customer@ascenta.local", displayName: "Alex Morgan", passwordHash: demoPasswordHash, roles: ["CUSTOMER"], organizationIds: [] },
    { id: "20000000-0000-4000-8000-000000000002", email: "demo.corporate@ascenta.local", displayName: "Jordan Lee", passwordHash: demoPasswordHash, roles: ["CUSTOMER", "CORPORATE_ADMIN"], organizationIds: ["10000000-0000-4000-8000-000000000001"] },
  ];
  private readonly sessions = new Map<string, RepositorySession>();
  private readonly reservations: ReservationView[] = [];

  async health() {}

  async findUserByEmail(email: string) {
    return this.users.find((user) => user.email === email.toLowerCase()) ?? null;
  }

  async createSession(input: { userId: string; tokenHash: string; csrfTokenHash: string; expiresAt: Date }) {
    const user = this.users.find((candidate) => candidate.id === input.userId);
    if (!user) throw new Error("Demo user missing");
    this.sessions.set(input.tokenHash, { ...input, user });
  }

  async findSession(tokenHash: string) {
    const session = this.sessions.get(tokenHash);
    if (!session || session.revokedAt || session.expiresAt <= new Date()) return null;
    return session;
  }

  async revokeSession(tokenHash: string) {
    const session = this.sessions.get(tokenHash);
    if (session) session.revokedAt = new Date();
  }

  async getCatalog(): Promise<CatalogView> {
    return {
      serviceTypes: [
        ["ONE_WAY", "One Way"], ["AIRPORT_TRANSFER", "Airport Transfer"], ["HOURLY", "Hourly"], ["ROUND_TRIP", "Round Trip"], ["CITY_TO_CITY", "City-to-City"],
      ].map(([code, name]) => ({ code, name })),
      vehicleClasses: [
        { code: "EXECUTIVE_SUV", name: "Executive SUV", passengerLimit: 3, luggageLimit: 3 },
        { code: "PREMIUM_SUV", name: "Premium SUV", passengerLimit: 5, luggageLimit: 5 },
        { code: "EXECUTIVE_VAN", name: "Executive Van", passengerLimit: 10, luggageLimit: 10 },
      ],
    };
  }

  async listReservations(user: RepositoryUser) {
    return this.reservations.filter((reservation) => reservation.organizationId ? user.organizationIds.includes(reservation.organizationId) : reservation.id.startsWith(user.id));
  }

  async createReservation(user: RepositoryUser, input: ReservationCreateInput) {
    const existing = this.reservations.find((item) => (item as ReservationView & { idempotencyKey?: string }).idempotencyKey === input.idempotencyKey);
    if (existing) {
      const allowed = existing.organizationId ? user.organizationIds.includes(existing.organizationId) : existing.id.startsWith(user.id);
      if (!allowed) throw Object.assign(new Error("Idempotency key is already in use"), { status: 409, code: "IDEMPOTENCY_KEY_CONFLICT" });
      return existing;
    }
    if (input.organizationId && !user.organizationIds.includes(input.organizationId)) throw Object.assign(new Error("Organization access denied"), { status: 403, code: "FORBIDDEN" });
    const reservation: ReservationView & { idempotencyKey: string } = {
      id: `${user.id}:${randomUUID()}`,
      status: "REQUESTED",
      serviceTypeCode: input.serviceTypeCode,
      vehicleClassCode: input.vehicleClassCode,
      pickupAddress: input.pickupAddress,
      destinationAddress: input.destinationAddress,
      scheduledAt: new Date(input.scheduledAt).toISOString(),
      scheduledTimeZone: input.scheduledTimeZone,
      passengerCount: input.passengerCount,
      organizationId: input.organizationId,
      createdAt: new Date().toISOString(),
      idempotencyKey: input.idempotencyKey,
    };
    this.reservations.push(reservation);
    return reservation;
  }

  async close() {}
}
