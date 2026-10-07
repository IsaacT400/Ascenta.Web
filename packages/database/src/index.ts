import { config } from "dotenv";
import { createHash } from "node:crypto";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { PrismaClient } from "@prisma/client";

config({ path: new URL("../../../.env", import.meta.url), quiet: true });

export function createPrismaClient() {
  if (process.env.NODE_ENV === "test" && !process.env.TEST_DATABASE_URL) {
    throw new Error("Set TEST_DATABASE_URL to an isolated MySQL test database before creating a test Prisma client.");
  }
  const connectionString = process.env.NODE_ENV === "test" ? process.env.TEST_DATABASE_URL : process.env.DATABASE_URL;
  if (!connectionString) throw new Error("Set DATABASE_URL to the MySQL database before starting the API.");
  const connection = new URL(connectionString);
  if (connection.protocol !== "mysql:") throw new Error("DATABASE_URL must use the mysql: protocol.");
  if (process.env.NODE_ENV === "test" && !decodeURIComponent(connection.pathname).endsWith("_test")) {
    throw new Error("TEST_DATABASE_URL must point to an isolated database whose name ends in _test.");
  }
  const adapter = new PrismaMariaDb({
    host: connection.hostname,
    port: Number(connection.port || 3306),
    user: decodeURIComponent(connection.username),
    password: decodeURIComponent(connection.password),
    database: decodeURIComponent(connection.pathname.slice(1)),
    connectionLimit: 8,
  });

  return new PrismaClient({ adapter });
}

export type AscentaPrismaClient = ReturnType<typeof createPrismaClient>;

export function hashReservationInput(input: object) {
  const canonical = JSON.stringify(Object.fromEntries(Object.entries(input).sort(([left], [right]) => left.localeCompare(right))));
  return createHash("sha256").update(canonical).digest("hex");
}
