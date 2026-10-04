import "dotenv/config";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { PrismaClient } from "@prisma/client";

export function createPrismaClient() {
  const adapter = new PrismaMariaDb({
    host: process.env.DATABASE_HOST ?? "127.0.0.1",
    port: Number(process.env.DATABASE_PORT ?? 3306),
    user: process.env.DATABASE_USER ?? "ascenta",
    password: process.env.DATABASE_PASSWORD ?? "change-me-local-only",
    database: process.env.DATABASE_NAME ?? "ascenta_dev",
    connectionLimit: 8,
  });

  return new PrismaClient({ adapter });
}

export type AscentaPrismaClient = ReturnType<typeof createPrismaClient>;
