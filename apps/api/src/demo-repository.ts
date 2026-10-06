import { hashSync } from "bcryptjs";
import { randomUUID } from "node:crypto";

import type { CatalogView, ReservationCreateInput, ReservationView } from "@ascenta/shared";
import type { AscentaRepository, RepositorySession, RepositoryUser } from "./repository.js";
import { hashReservationInput } from "@ascenta/database";

const demoPasswordHash = hashSync("AscentaDemo!2026", 10);

export class DemoRepository implements AscentaRepository {
  private readonly users: RepositoryUser[] = [
    { id: "20000000-0000-4000-8000-000000000001", email: "demo.customer@ascenta.local", displayName: "Alex Morgan", passwordHash: demoPasswordHash, roles: ["CUSTOMER"], organizationIds: [], emailVerified: true },
    { id: "20000000-0000-4000-8000-000000000002", email: "demo.corporate@ascenta.local", displayName: "Jordan Lee", passwordHash: demoPasswordHash, roles: ["CUSTOMER", "CORPORATE_ADMIN"], organizationIds: ["10000000-0000-4000-8000-000000000001"], emailVerified: true },
    { id: "20000000-0000-4000-8000-000000000003", email: "demo.admin@ascenta.local", displayName: "Ascenta Operations", passwordHash: demoPasswordHash, roles: ["CUSTOMER", "ASCENTA_ADMIN"], organizationIds: [], emailVerified: true },
  ];
  private readonly sessions = new Map<string, RepositorySession>();
  private readonly reservations: Array<ReservationView & { idempotencyKey: string; requestHash: string; createdByUserId: string }> = [];
  private readonly verificationTokens = new Map<string, { userId: string; expiresAt: number }>();

  async health() {}

  async findUserByEmail(email: string) {
    return this.users.find((user) => user.email === email.toLowerCase()) ?? null;
  }

  async registerUser(input: { email: string; displayName: string; passwordHash: string; tokenHash: string; expiresAt: Date }) {
    if (this.users.some((user) => user.email === input.email.toLowerCase())) return "exists" as const;
    const id = randomUUID();
    this.users.push({ id, email: input.email.toLowerCase(), displayName: input.displayName, passwordHash: input.passwordHash, roles: ["CUSTOMER"], organizationIds: [], emailVerified: false });
    this.verificationTokens.set(input.tokenHash, { userId: id, expiresAt: input.expiresAt.getTime() });
    return "created" as const;
  }

  async verifyEmail(tokenHash: string) {
    const token = this.verificationTokens.get(tokenHash);
    const user = token && token.expiresAt > Date.now() ? this.users.find((candidate) => candidate.id === token.userId) : null;
    if (!user) return false;
    user.emailVerified = true;
    this.verificationTokens.delete(tokenHash);
    return true;
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
    return this.reservations.filter((reservation) => reservation.createdByUserId === user.id || (reservation.organizationId ? user.organizationIds.includes(reservation.organizationId) : false)).map(({ idempotencyKey: _key, requestHash: _hash, createdByUserId: _creator, ...reservation }) => reservation);
  }

  async listOperationsReservations() {
    return [...this.reservations].sort((left, right) => right.createdAt.localeCompare(left.createdAt)).map(({ idempotencyKey: _key, requestHash: _hash, createdByUserId, ...reservation }) => {
      const requester = this.users.find((user) => user.id === createdByUserId);
      return { ...reservation, requesterName: requester?.displayName, requesterEmail: requester?.email };
    });
  }

  async createReservation(user: RepositoryUser, input: ReservationCreateInput) {
    const existing = this.reservations.find((item) => item.idempotencyKey === input.idempotencyKey);
    if (existing) {
      const allowed = existing.createdByUserId === user.id || Boolean(existing.organizationId && user.organizationIds.includes(existing.organizationId));
      if (!allowed) throw Object.assign(new Error("Idempotency key is already in use"), { status: 409, code: "IDEMPOTENCY_KEY_CONFLICT" });
      if (existing.requestHash !== hashReservationInput(input)) throw Object.assign(new Error("The idempotency key was already used for different trip details"), { status: 409, code: "IDEMPOTENCY_PAYLOAD_CONFLICT" });
      const { idempotencyKey: _key, requestHash: _hash, createdByUserId: _creator, ...view } = existing;
      return view;
    }
    if (input.organizationId && !user.organizationIds.includes(input.organizationId)) throw Object.assign(new Error("Organization access denied"), { status: 403, code: "FORBIDDEN" });
    const reservation: ReservationView & { idempotencyKey: string; requestHash: string } = {
      id: `${user.id}:${randomUUID()}`,
      reference: `ASC-${randomUUID().replaceAll("-", "").slice(0, 16).toUpperCase()}`,
      status: "REQUESTED",
      serviceTypeCode: input.serviceTypeCode,
      vehicleClassCode: input.vehicleClassCode,
      pickupAddress: input.pickupAddress,
      destinationAddress: input.destinationAddress,
      scheduledAt: new Date(input.scheduledAt).toISOString(),
      scheduledTimeZone: input.scheduledTimeZone,
      passengerCount: input.passengerCount,
      durationHours: input.durationHours,
      passengerName: input.passengerName,
      passengerEmail: input.passengerEmail,
      passengerPhone: input.passengerPhone,
      organizationId: input.organizationId,
      createdAt: new Date().toISOString(),
      idempotencyKey: input.idempotencyKey,
      requestHash: hashReservationInput(input),
    };
    this.reservations.push({ ...reservation, createdByUserId: user.id });
    const { idempotencyKey: _key, requestHash: _hash, ...view } = reservation;
    return view;
  }

  async close() {}
}
