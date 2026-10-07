import type { ReservationCreateInput, ReservationView, Role } from "@ascenta/shared";
import { randomUUID } from "node:crypto";
import { createPrismaClient, hashReservationInput, type AscentaPrismaClient } from "@ascenta/database";

import type { AscentaRepository, RepositoryUser } from "./repository.js";

type MembershipRecord = { role: "CORPORATE_BOOKER" | "CORPORATE_ADMIN"; organizationId: string };
type ServiceTypeRecord = { code: string; name: string };
type VehicleClassRecord = ServiceTypeRecord & { passengerLimit: number; luggageLimit: number };
type ReservationRecord = { notes: string | null; id: string; reference: string; status: ReservationView["status"]; pickupAddress: string; destinationAddress: string | null; scheduledAtUtc: Date; scheduledTimeZone: string; passengerCount: number; passengerName: string | null; passengerEmail: string | null; passengerPhone: string | null; durationHours: number | { toString(): string } | null; organizationId: string | null; createdAt: Date; serviceType: { code: string }; vehicleClass: { code: string } };

// Preserve the approved catalog's editorial sequence, independent of translated names.
const serviceTypeOrder = ["ONE_WAY", "AIRPORT_TRANSFER", "HOURLY", "ROUND_TRIP", "CITY_TO_CITY"];
const vehicleClassOrder = ["EXECUTIVE_SUV", "PREMIUM_SUV", "EXECUTIVE_VAN"];

function orderCatalog<T extends ServiceTypeRecord>(items: T[], codes: string[]) {
  const positions = new Map(codes.map((code, index) => [code, index]));
  return items.toSorted((left, right) =>
    (positions.get(left.code) ?? codes.length) - (positions.get(right.code) ?? codes.length)
    || left.code.localeCompare(right.code),
  );
}

export class MySqlRepository implements AscentaRepository {
  constructor(private readonly prisma: AscentaPrismaClient = createPrismaClient()) {}

  async health() { await this.prisma.$queryRaw`SELECT 1`; }

  async findUserByEmail(email: string): Promise<RepositoryUser | null> {
    const user = await this.prisma.user.findFirst({
      where: { email: email.toLowerCase(), status: "ACTIVE" },
      include: { memberships: true },
    });
    if (!user) return null;
    const roles: Role[] = ["CUSTOMER"];
    for (const membership of user.memberships as MembershipRecord[]) roles.push(membership.role);
    if (user.isAdmin) roles.push("ASCENTA_ADMIN");
    return { id: user.id, email: user.email, displayName: user.displayName, passwordHash: user.passwordHash, roles: [...new Set(roles)], organizationIds: (user.memberships as MembershipRecord[]).map((membership) => membership.organizationId), emailVerified: user.emailVerified };
  }

  async registerUser(input: { email: string; displayName: string; passwordHash: string; tokenHash: string; expiresAt: Date }) {
    try {
      await this.prisma.$transaction(async (transaction) => {
        const user = await transaction.user.create({ data: { email: input.email.toLowerCase(), displayName: input.displayName, passwordHash: input.passwordHash, emailVerified: false } });
        await transaction.emailVerificationToken.create({ data: { userId: user.id, tokenHash: input.tokenHash, expiresAt: input.expiresAt } });
      });
      return "created" as const;
    } catch (error) {
      if ((error as { code?: string }).code === "P2002") return "exists" as const;
      throw error;
    }
  }

  async verifyEmail(tokenHash: string) {
    return this.prisma.$transaction(async (transaction) => {
      const token = await transaction.emailVerificationToken.findUnique({ where: { tokenHash } });
      if (!token || token.consumedAt || token.expiresAt <= new Date()) return false;
      const used = await transaction.emailVerificationToken.updateMany({ where: { id: token.id, consumedAt: null, expiresAt: { gt: new Date() } }, data: { consumedAt: new Date() } });
      if (used.count !== 1) return false;
      await transaction.user.update({ where: { id: token.userId }, data: { emailVerified: true } });
      return true;
    });
  }

  async createSession(input: { userId: string; tokenHash: string; csrfTokenHash: string; expiresAt: Date }) {
    await this.prisma.session.create({ data: input });
  }

  async findSession(tokenHash: string) {
    const session = await this.prisma.session.findFirst({
      where: { tokenHash, revokedAt: null, expiresAt: { gt: new Date() }, user: { status: "ACTIVE" } },
      include: { user: { include: { memberships: true } } },
    });
    if (!session) return null;
    const memberships = session.user.memberships as MembershipRecord[];
    const roles: Role[] = ["CUSTOMER", ...memberships.map((membership) => membership.role)];
    if (session.user.isAdmin) roles.push("ASCENTA_ADMIN");
    return {
      tokenHash: session.tokenHash,
      csrfTokenHash: session.csrfTokenHash,
      expiresAt: session.expiresAt,
      revokedAt: session.revokedAt ?? undefined,
      user: { id: session.user.id, email: session.user.email, displayName: session.user.displayName, passwordHash: session.user.passwordHash, roles: [...new Set(roles)], organizationIds: memberships.map((membership) => membership.organizationId), emailVerified: session.user.emailVerified },
    };
  }

  async revokeSession(tokenHash: string) {
    await this.prisma.session.updateMany({ where: { tokenHash }, data: { revokedAt: new Date() } });
  }

  async getCatalog() {
    const [serviceTypes, vehicleClasses] = await Promise.all([
      this.prisma.serviceType.findMany({ where: { isActive: true } }),
      this.prisma.vehicleClass.findMany({ where: { isActive: true } }),
    ]);
    return {
      serviceTypes: orderCatalog(serviceTypes as ServiceTypeRecord[], serviceTypeOrder).map(({ code, name }) => ({ code, name })),
      vehicleClasses: orderCatalog(vehicleClasses as VehicleClassRecord[], vehicleClassOrder).map(({ code, name, passengerLimit, luggageLimit }) => ({ code, name, passengerLimit, luggageLimit })),
    };
  }

  private mapReservation(reservation: ReservationRecord): ReservationView {
    return { notes: reservation.notes ?? undefined, id: reservation.id, reference: reservation.reference, status: reservation.status, serviceTypeCode: reservation.serviceType.code, vehicleClassCode: reservation.vehicleClass.code, pickupAddress: reservation.pickupAddress, destinationAddress: reservation.destinationAddress ?? undefined, scheduledAt: reservation.scheduledAtUtc.toISOString(), scheduledTimeZone: reservation.scheduledTimeZone, passengerCount: reservation.passengerCount, passengerName: reservation.passengerName ?? undefined, passengerEmail: reservation.passengerEmail ?? undefined, passengerPhone: reservation.passengerPhone ?? undefined, durationHours: reservation.durationHours === null ? undefined : Number(reservation.durationHours), organizationId: reservation.organizationId ?? undefined, createdAt: reservation.createdAt.toISOString() };
  }

  async listReservations(user: RepositoryUser) {
    const rows = await this.prisma.reservation.findMany({
      where: { OR: [{ createdById: user.id }, { organizationId: { in: user.organizationIds } }] },
      include: { serviceType: true, vehicleClass: true },
      orderBy: { scheduledAtUtc: "desc" },
    });
    return (rows as ReservationRecord[]).map((row) => this.mapReservation(row));
  }

  async listOperationsReservations() {
    const rows = await this.prisma.reservation.findMany({
      include: { serviceType: true, vehicleClass: true, createdBy: true },
      orderBy: { createdAt: "desc" },
    });
    return (rows as Array<ReservationRecord & { createdBy: { displayName: string; email: string } }>).map((row) => ({ ...this.mapReservation(row), requesterName: row.createdBy.displayName, requesterEmail: row.createdBy.email }));
  }

  async createReservation(user: RepositoryUser, input: ReservationCreateInput) {
    const existing = await this.prisma.reservation.findUnique({ where: { idempotencyKey: input.idempotencyKey }, include: { serviceType: true, vehicleClass: true } });
    if (existing) {
      const allowed = existing.createdById === user.id || Boolean(existing.organizationId && user.organizationIds.includes(existing.organizationId));
      if (!allowed) throw Object.assign(new Error("Idempotency key is already in use"), { status: 409, code: "IDEMPOTENCY_KEY_CONFLICT" });
      if (existing.requestHash && existing.requestHash !== hashReservationInput(input)) throw Object.assign(new Error("The idempotency key was already used for different trip details"), { status: 409, code: "IDEMPOTENCY_PAYLOAD_CONFLICT" });
      return this.mapReservation(existing);
    }
    if (input.organizationId && !user.organizationIds.includes(input.organizationId)) throw Object.assign(new Error("Organization access denied"), { status: 403, code: "FORBIDDEN" });
    const [serviceType, vehicleClass] = await Promise.all([
      this.prisma.serviceType.findUnique({ where: { code: input.serviceTypeCode } }),
      this.prisma.vehicleClass.findUnique({ where: { code: input.vehicleClassCode } }),
    ]);
    if (!serviceType || !vehicleClass) throw Object.assign(new Error("Catalog selection not available"), { status: 422, code: "CATALOG_SELECTION_INVALID" });
    const reference = `ASC-${randomUUID().replaceAll("-", "").slice(0, 16).toUpperCase()}`;
    try {
      const reservation = await this.prisma.reservation.create({
        data: { reference, createdById: user.id, organizationId: input.organizationId, serviceTypeId: serviceType.id, vehicleClassId: vehicleClass.id, pickupAddress: input.pickupAddress, destinationAddress: input.destinationAddress, scheduledAtUtc: new Date(input.scheduledAt), scheduledTimeZone: input.scheduledTimeZone, passengerCount: input.passengerCount, passengerName: input.passengerName, passengerEmail: input.passengerEmail, passengerPhone: input.passengerPhone, durationHours: input.durationHours, notes: input.notes, idempotencyKey: input.idempotencyKey, requestHash: hashReservationInput(input) },
        include: { serviceType: true, vehicleClass: true },
      });
      return this.mapReservation(reservation);
    } catch (error) {
      if ((error as { code?: string }).code !== "P2002") throw error;
      const winner = await this.prisma.reservation.findUnique({ where: { idempotencyKey: input.idempotencyKey }, include: { serviceType: true, vehicleClass: true } });
      if (!winner || (winner.createdById !== user.id && !(winner.organizationId && user.organizationIds.includes(winner.organizationId)))) throw Object.assign(new Error("Idempotency key is already in use"), { status: 409, code: "IDEMPOTENCY_KEY_CONFLICT" });
      if (winner.requestHash && winner.requestHash !== hashReservationInput(input)) throw Object.assign(new Error("The idempotency key was already used for different trip details"), { status: 409, code: "IDEMPOTENCY_PAYLOAD_CONFLICT" });
      return this.mapReservation(winner);
    }
  }

  async close() { await this.prisma.$disconnect(); }
}
