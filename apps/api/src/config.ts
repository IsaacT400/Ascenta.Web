import { config } from "dotenv";
import { z } from "zod";

config({ path: new URL("../../../.env", import.meta.url), quiet: true });

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  API_PORT: z.coerce.number().int().min(1).max(65535).default(4000),
  WEB_ORIGIN: z.string().url().default("http://localhost:5175"),
  SESSION_COOKIE_NAME: z.string().min(1).default("ascenta_session"),
  CSRF_COOKIE_NAME: z.string().min(1).default("ascenta_csrf"),
  SESSION_TTL_HOURS: z.coerce.number().positive().max(168).default(12),
  DATA_MODE: z.enum(["mysql", "demo"]).default("mysql"),
  TRUST_PROXY: z.enum(["true", "false"]).default("false"),
});

export type AppConfig = {
  nodeEnv: "development" | "test" | "production";
  port: number;
  webOrigin: string;
  sessionCookieName: string;
  csrfCookieName: string;
  sessionTtlHours: number;
  dataMode: "mysql" | "demo";
  trustProxy: boolean;
};

export function loadConfig(source: NodeJS.ProcessEnv = process.env): AppConfig {
  const env = envSchema.parse(source);
  if (env.NODE_ENV === "production" && env.DATA_MODE === "demo") {
    throw new Error("DATA_MODE=demo is available only for explicit local development or tests.");
  }
  return {
    nodeEnv: env.NODE_ENV,
    port: env.API_PORT,
    webOrigin: env.WEB_ORIGIN,
    sessionCookieName: env.SESSION_COOKIE_NAME,
    csrfCookieName: env.CSRF_COOKIE_NAME,
    sessionTtlHours: env.SESSION_TTL_HOURS,
    dataMode: env.DATA_MODE,
    trustProxy: env.TRUST_PROXY === "true",
  };
}
