import { createPrismaClient } from "../src/index.js";
import { seedCatalog } from "./seed-catalog.js";

const prisma = createPrismaClient();
try {
  await seedCatalog(prisma);
  console.info("Ascenta service and vehicle catalog is ready. No demo accounts or trips were created.");
} finally {
  await prisma.$disconnect();
}
