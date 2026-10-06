import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    url: process.env.NODE_ENV === "test"
      ? process.env.TEST_DATABASE_URL ?? "mysql://ascenta:change-me-local-only@127.0.0.1:3306/ascenta_test"
      : process.env.DATABASE_URL ?? "mysql://ascenta:change-me-local-only@127.0.0.1:3306/ascenta_dev",
  },
});
