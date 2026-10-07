import type { AscentaPrismaClient } from "../src/index.js";

/** The operational catalog; no accounts, sessions, or fictional trips are created. */
export async function seedCatalog(prisma: AscentaPrismaClient) {
  const serviceTypes = [
    ["ONE_WAY", "One Way"],
    ["AIRPORT_TRANSFER", "Airport Transfer"],
    ["HOURLY", "Hourly"],
    ["ROUND_TRIP", "Round Trip"],
    ["CITY_TO_CITY", "City-to-City"],
  ] as const;
  for (const [code, name] of serviceTypes) {
    await prisma.serviceType.upsert({ where: { code }, update: {}, create: { code, name } });
  }
  const vehicleClasses = [
    ["EXECUTIVE_SUV", "Executive SUV", 3, 3],
    ["PREMIUM_SUV", "Premium SUV", 5, 5],
    ["EXECUTIVE_VAN", "Executive Van", 10, 10],
  ] as const;
  for (const [code, name, passengerLimit, luggageLimit] of vehicleClasses) {
    await prisma.vehicleClass.upsert({
      where: { code }, update: {}, create: { code, name, passengerLimit, luggageLimit },
    });
  }
}
