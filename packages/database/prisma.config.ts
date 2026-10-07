import { config } from "dotenv";
import { defineConfig } from "prisma/config";

config({ path: new URL("../../.env", import.meta.url), quiet: true });
const databaseUrl = process.env.NODE_ENV === "test" ? process.env.TEST_DATABASE_URL : process.env.DATABASE_URL;
if (process.env.NODE_ENV === "test" && databaseUrl && !new URL(databaseUrl).pathname.endsWith("_test")) {
  throw new Error("TEST_DATABASE_URL must point to an isolated database whose name ends in _test.");
}

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    // Generation does not connect. Migration/seed commands require the configured URL.
    url: databaseUrl,
  },
});
