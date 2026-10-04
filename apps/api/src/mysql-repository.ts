import type { ReservationCreateInput, ReservationView, Role } from "@ascenta/shared";
import { createPrismaClient, type AscentaPrismaClient } from "@ascenta/database";

import type { AscentaRepository, RepositoryUser } from "./repository.js";

type MembershipRecord = { role: "CORPORATE_BOOKER" | "CORPORATE_ADMIN"; organizationId: string };
type ServiceTypeRecord = { code: string; name: string };
type VehicleClassRecord = ServiceTypeRecord & { passengerLimit: number; luggageLimit: number };
type ReservationRecord = { id: string; status: ReservationView["status"]; pickupAddress: string; destinationAddress: string; scheduledAtUtc: Date; scheduledTimeZone: string; passengerCount: number; organizationId: string | null; createdAt: Date; serviceType: { code: string }; vehicleClass: { code: string } };

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
    return { id: user.id, email: user.email, displayName: user.displayName, passwordHash: user.passwordHash, roles: [...new Set(roles)], organizationIds: (user.memberships as MembershipRecord[]).map((membership) => membership.organizationId) };
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
      user: { id: session.user.id, email: session.user.email, displayName: session.user.displayName, passwordHash: session.user.passwordHash, roles: [...new Set(roles)], organizationIds: memberships.map((membership) => membership.organizationId) },
    };
  }

  async revokeSession(tokenHash: string) {
    await this.prisma.session.updateMany({ where: { tokenHash }, data: { revokedAt: new Date() } });
  }

  async getCatalog() {
    const [serviceTypes, vehicleClasses] = await Promise.all([
      this.prisma.serviceType.findMany({ where: { isActive: true }, orderBy: { name: "asc" } }),
      this.prisma.vehicleClass.findMany({ where: { isActive: true }, orderBy: { name: "asc" } }),
    ]);
    return {
      serviceTypes: (serviceTypes as ServiceTypeRecord[]).map(({ code, name }) => ({ code, name })),
      vehicleClasses: (vehicleClasses as VehicleClassRecord[]).map(({ code, name, passengerLimit, luggageLimit }) => ({ code, name, passengerLimit, luggageLimit })),
    };
  }

  private mapReservation(reservation: ReservationRecord): ReservationView {
    return { id: reservation.id, status: reservation.status, serviceTypeCode: reservation.serviceType.code, vehicleClassCode: reservation.vehicleClass.code, pickupAddress: reservation.pickupAddress, destinationAddress: reservation.destinationAddress, scheduledAt: reservation.scheduledAtUtc.toISOString(), scheduledTimeZone: reservation.scheduledTimeZone, passengerCount: reservation.passengerCount, organizationId: reservation.organizationId ?? undefined, createdAt: reservation.createdAt.toISOString() };
  }

  async listReservations(user: RepositoryUser) {
    const rows = await this.prisma.reservation.findMany({
      where: { OR: [{ createdById: user.id }, { organizationId: { in: user.organizationIds } }] },
      include: { serviceType: true, vehicleClass: true },
      orderBy: { scheduledAtUtc: "desc" },
    });
    return (rows as ReservationRecord[]).map((row) => this.mapReservation(row));
  }

  async createReservation(user: RepositoryUser, input: ReservationCreateInput) {
    const existing = await this.prisma.reservation.findUnique({ where: { idempotencyKey: input.idempotencyKey }, include: { serviceType: true, vehicleClass: true } });
    if (existing) {
      const allowed = existing.createdById === user.id || Boolean(existing.organizationId && user.organizationIds.includes(existing.organizationId));
      if (!allowed) throw Object.assign(new Error("Idempotency key is already in use"), { status: 409, code: "IDEMPOTENCY_KEY_CONFLICT" });
      return this.mapReservation(existing);
    }
    if (input.organizationId && !user.organizationIds.includes(input.organizationId)) throw Object.assign(new Error("Organization access denied"), { status: 403, code: "FORBIDDEN" });
    const [serviceType, vehicleClass] = await Promise.all([
      this.prisma.serviceType.findUnique({ where: { code: input.serviceTypeCode } }),
      this.prisma.vehicleClass.findUnique({ where: { code: input.vehicleClassCode } }),
    ]);
    if (!serviceType || !vehicleClass) throw Object.assign(new Error("Catalog selection not available"), { status: 422, code: "CATALOG_SELECTION_INVALID" });
    const reference = `ASC-${Date.now().toString(36).toUpperCase()}-${Math.floor(Math.random() * 1296).toString(36).padStart(2, "0").toUpperCase()}`;
    try {
      const reservation = await this.prisma.reservation.create({
        data: { reference, createdById: user.id, organizationId: input.organizationId, serviceTypeId: serviceType.id, vehicleClassId: vehicleClass.id, pickupAddress: input.pickupAddress, destinationAddress: input.destinationAddress, scheduledAtUtc: new Date(input.scheduledAt), scheduledTimeZone: input.scheduledTimeZone, passengerCount: input.passengerCount, notes: input.notes, idempotencyKey: input.idempotencyKey },
        include: { serviceType: true, vehicleClass: true },
      });
      return this.mapReservation(reservation);
    } catch (error) {
      if ((error as { code?: string }).code !== "P2002") throw error;
      const winner = await this.prisma.reservation.findUnique({ where: { idempotencyKey: input.idempotencyKey }, include: { serviceType: true, vehicleClass: true } });
      if (!winner || (winner.createdById !== user.id && !(winner.organizationId && user.organizationIds.includes(winner.organizationId)))) throw Object.assign(new Error("Idempotency key is already in use"), { status: 409, code: "IDEMPOTENCY_KEY_CONFLICT" });
      return this.mapReservation(winner);
    }
  }

  async close() { await this.prisma.$disconnect(); }
}
