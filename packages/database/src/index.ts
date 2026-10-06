import "dotenv/config";
import { createHash } from "node:crypto";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { PrismaClient } from "@prisma/client";

export function createPrismaClient() {
  if (process.env.NODE_ENV === "test" && !process.env.TEST_DATABASE_URL) {
    throw new Error("Set TEST_DATABASE_URL to an isolated MySQL test database before creating a test Prisma client.");
  }
  const connectionString = process.env.NODE_ENV === "test" ? process.env.TEST_DATABASE_URL : process.env.DATABASE_URL;
  const connection = connectionString ? new URL(connectionString) : undefined;
  if (connection && connection.protocol !== "mysql:") throw new Error("DATABASE_URL must use the mysql: protocol.");
  const adapter = new PrismaMariaDb({
    host: connection?.hostname ?? process.env.DATABASE_HOST ?? "127.0.0.1",
    port: Number(connection?.port || process.env.DATABASE_PORT || 3306),
    user: connection ? decodeURIComponent(connection.username) : process.env.DATABASE_USER ?? "ascenta",
    password: connection ? decodeURIComponent(connection.password) : process.env.DATABASE_PASSWORD ?? "change-me-local-only",
    database: connection ? decodeURIComponent(connection.pathname.slice(1)) : process.env.DATABASE_NAME ?? "ascenta_dev",
    connectionLimit: 8,
  });

  return new PrismaClient({ adapter });
}

export type AscentaPrismaClient = ReturnType<typeof createPrismaClient>;

export function hashReservationInput(input: object) {
  const canonical = JSON.stringify(Object.fromEntries(Object.entries(input).sort(([left], [right]) => left.localeCompare(right))));
  return createHash("sha256").update(canonical).digest("hex");
}
