import { hash } from "bcryptjs";
import { seedCatalog } from "./seed-catalog.js";

import { createPrismaClient, hashReservationInput } from "../src/index.js";

const prisma = createPrismaClient();
const DEMO_PASSWORD = "AscentaDemo!2026";

if (process.env.NODE_ENV === "production") {
  throw new Error("The fictional development seed is disabled in production.");
}

async function main() {
  const passwordHash = await hash(DEMO_PASSWORD, 12);

  const [customer, corporate, admin] = await Promise.all([
    prisma.user.upsert({
      where: { email: "demo.customer@ascenta.local" },
      update: { displayName: "Alex Morgan", passwordHash, status: "ACTIVE" },
      create: { email: "demo.customer@ascenta.local", displayName: "Alex Morgan", passwordHash },
    }),
    prisma.user.upsert({
      where: { email: "demo.corporate@ascenta.local" },
      update: { displayName: "Jordan Lee", passwordHash, status: "ACTIVE" },
      create: { email: "demo.corporate@ascenta.local", displayName: "Jordan Lee", passwordHash },
    }),
    prisma.user.upsert({
      where: { email: "demo.admin@ascenta.local" },
      update: { displayName: "Ascenta Demo Admin", passwordHash, status: "ACTIVE", isAdmin: true },
      create: { email: "demo.admin@ascenta.local", displayName: "Ascenta Demo Admin", passwordHash, isAdmin: true },
    }),
  ]);

  const organization = await prisma.organization.upsert({
    where: { id: "10000000-0000-4000-8000-000000000001" },
    update: { name: "Apex Consulting (Demo)", status: "ACTIVE" },
    create: { id: "10000000-0000-4000-8000-000000000001", name: "Apex Consulting (Demo)" },
  });

  await prisma.membership.upsert({
    where: { userId_organizationId: { userId: corporate.id, organizationId: organization.id } },
    update: { role: "CORPORATE_ADMIN" },
    create: { userId: corporate.id, organizationId: organization.id, role: "CORPORATE_ADMIN" },
  });

  await seedCatalog(prisma);

  const serviceType = await prisma.serviceType.findUniqueOrThrow({ where: { code: "AIRPORT_TRANSFER" } });
  const vehicleClass = await prisma.vehicleClass.findUniqueOrThrow({ where: { code: "EXECUTIVE_SUV" } });
  const seededRequest = {
    serviceTypeCode: "AIRPORT_TRANSFER",
    vehicleClassCode: "EXECUTIVE_SUV",
    pickupAddress: "JFK Airport, Queens, NY",
    destinationAddress: "The Plaza, New York, NY",
    scheduledAt: "2026-09-22T14:30:00.000Z",
    scheduledTimeZone: "America/New_York",
    passengerCount: 2,
    notes: "Synthetic local-development reservation.",
    idempotencyKey: "seed-demo-reservation-2026",
  };
  await prisma.reservation.upsert({
    where: { idempotencyKey: "seed-demo-reservation-2026" },
    update: {},
    create: {
      reference: "ASC-DEMO-0001",
      status: "CONFIRMED",
      createdById: customer.id,
      serviceTypeId: serviceType.id,
      vehicleClassId: vehicleClass.id,
      pickupAddress: "JFK Airport, Queens, NY",
      destinationAddress: "The Plaza, New York, NY",
      scheduledAtUtc: new Date("2026-09-22T14:30:00.000Z"),
      scheduledTimeZone: "America/New_York",
      passengerCount: 2,
      notes: "Synthetic local-development reservation.",
      idempotencyKey: "seed-demo-reservation-2026",
      requestHash: hashReservationInput(seededRequest),
    },
  });

  console.info("Explicit fictional development fixtures are ready.");
  void admin;
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
