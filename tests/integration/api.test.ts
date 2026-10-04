import request from "supertest";
import { beforeEach, describe, expect, it } from "vitest";

import { createApp } from "../../apps/api/src/app.js";
import { DemoRepository } from "../../apps/api/src/demo-repository.js";
import type { AppConfig } from "../../apps/api/src/config.js";

const config: AppConfig = {
  nodeEnv: "test",
  port: 4000,
  webOrigin: "http://localhost:5173",
  sessionCookieName: "ascenta_session",
  csrfCookieName: "ascenta_csrf",
  sessionTtlHours: 12,
  dataMode: "demo",
  trustProxy: false,
};

describe("Ascenta API", () => {
  let agent: ReturnType<typeof request.agent>;

  beforeEach(() => {
    agent = request.agent(createApp({ repository: new DemoRepository(), config }));
  });

  it("reports health and its explicit data mode", async () => {
    const response = await agent.get("/api/v1/health").expect(200);
    expect(response.body.data).toEqual({ status: "ok", dataMode: "demo" });
    expect(response.headers["x-request-id"]).toBeTruthy();
  });

  it("rejects protected routes without a session", async () => {
    const response = await agent.get("/api/v1/reservations").expect(401);
    expect(response.body.error.code).toBe("AUTH_REQUIRED");
  });

  it("authenticates a fictional account and creates an idempotent reservation", async () => {
    const login = await agent.post("/api/v1/auth/login").send({ email: "demo.customer@ascenta.local", password: "AscentaDemo!2026" }).expect(200);
    expect(login.body.data.user.roles).toContain("CUSTOMER");
    const csrfToken = login.body.data.csrfToken as string;
    const payload = {
      serviceTypeCode: "AIRPORT_TRANSFER",
      vehicleClassCode: "EXECUTIVE_SUV",
      pickupAddress: "JFK Airport, Queens, NY",
      destinationAddress: "The Plaza, New York, NY",
      scheduledAt: "2026-11-22T15:30:00-05:00",
      scheduledTimeZone: "America/New_York",
      passengerCount: 2,
      idempotencyKey: "integration-test-reservation-001",
    };
    const first = await agent.post("/api/v1/reservations").set("x-csrf-token", csrfToken).send(payload).expect(201);
    const second = await agent.post("/api/v1/reservations").set("x-csrf-token", csrfToken).send(payload).expect(201);
    expect(second.body.data.id).toBe(first.body.data.id);
    const list = await agent.get("/api/v1/reservations").expect(200);
    expect(list.body.data).toHaveLength(1);
  });

  it("requires a valid CSRF token for mutations", async () => {
    await agent.post("/api/v1/auth/login").send({ email: "demo.customer@ascenta.local", password: "AscentaDemo!2026" }).expect(200);
    const response = await agent.post("/api/v1/reservations").send({}).expect(403);
    expect(response.body.error.code).toBe("CSRF_INVALID");
  });
});
