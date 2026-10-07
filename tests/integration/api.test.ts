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
  let operationsAgent: ReturnType<typeof request.agent>;

  beforeEach(() => {
    const app = createApp({ repository: new DemoRepository(), config });
    agent = request.agent(app);
    operationsAgent = request.agent(app);
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

  it("registers and verifies a local account before allowing login", async () => {
    const registration = await agent.post("/api/v1/auth/register").send({ email: "new.person@example.test", displayName: "New Person", password: "LocalOnlyPassword!2026", termsAccepted: true }).expect(202);
    expect(registration.body.data.delivery).toBe("local_only");
    expect(registration.body.data.localVerificationToken).toBeTruthy();
    await agent.post("/api/v1/auth/login").send({ email: "new.person@example.test", password: "LocalOnlyPassword!2026" }).expect(403);
    await agent.post("/api/v1/auth/verify-email").send({ token: registration.body.data.localVerificationToken }).expect(200);
    await agent.post("/api/v1/auth/verify-email").send({ token: registration.body.data.localVerificationToken }).expect(400);
    await agent.post("/api/v1/auth/login").send({ email: "new.person@example.test", password: "LocalOnlyPassword!2026" }).expect(200);
  });

  it("returns the persisted request and its same reference to the customer and authorized operations", async () => {
    const signup = await agent.post("/api/v1/auth/register").send({ email: "requester@example.test", displayName: "Trip Requester", password: "LocalOnlyPassword!2026", termsAccepted: true }).expect(202);
    await agent.post("/api/v1/auth/verify-email").send({ token: signup.body.data.localVerificationToken }).expect(200);
    const login = await agent.post("/api/v1/auth/login").send({ email: "requester@example.test", password: "LocalOnlyPassword!2026" }).expect(200);
    const input = {
      serviceTypeCode: "AIRPORT_TRANSFER", vehicleClassCode: "EXECUTIVE_SUV", pickupAddress: "Logan Airport", destinationAddress: "Boston", scheduledAt: "2026-11-22T15:30:00-05:00", scheduledTimeZone: "America/New_York", passengerCount: 2, passengerName: "Traveler Example", passengerEmail: "traveler@example.test", notes: "Meet at terminal B.\n\nLuggage / Equipaje: 2\nFlight / Vuelo: Arrival / Llegada; AA123", idempotencyKey: "request-vertical-flow-01",
    };
    const created = await agent.post("/api/v1/reservations").set("x-csrf-token", login.body.data.csrfToken).send(input).expect(201);
    expect(created.body.data.reference).toMatch(/^ASC-/);
    expect(created.body.data.status).toBe("REQUESTED");
    const customerList = await agent.get("/api/v1/reservations").expect(200);
    expect(customerList.body.data[0].reference).toBe(created.body.data.reference);
    expect(customerList.body.data[0].passengerName).toBe("Traveler Example");
    expect(created.body.data.notes).toBe(input.notes);
    expect(customerList.body.data[0].notes).toBe(input.notes);
    await operationsAgent.post("/api/v1/auth/login").send({ email: "demo.admin@ascenta.local", password: "AscentaDemo!2026" }).expect(200);
    const operations = await operationsAgent.get("/api/v1/admin/reservations").expect(200);
    expect(operations.body.data[0].reference).toBe(created.body.data.reference);
    expect(operations.body.data[0].requesterEmail).toBe("requester@example.test");
    expect(operations.body.data[0].notes).toBe(input.notes);
    await agent.get("/api/v1/admin/reservations").expect(403);
  });

  it("rejects an idempotency key reused with different trip data", async () => {
    const login = await agent.post("/api/v1/auth/login").send({ email: "demo.customer@ascenta.local", password: "AscentaDemo!2026" }).expect(200);
    const input = { serviceTypeCode: "ONE_WAY", vehicleClassCode: "EXECUTIVE_SUV", pickupAddress: "A valid pickup", destinationAddress: "A valid destination", scheduledAt: "2026-11-22T15:30:00-05:00", scheduledTimeZone: "America/New_York", passengerCount: 1, idempotencyKey: "same-key-payload-001" };
    await agent.post("/api/v1/reservations").set("x-csrf-token", login.body.data.csrfToken).send(input).expect(201);
    await agent.post("/api/v1/reservations").set("x-csrf-token", login.body.data.csrfToken).send({ ...input, destinationAddress: "Changed destination" }).expect(409);
  });

  it("returns only the authenticated user's memberships and verification state", async () => {
    const login = await agent.post("/api/v1/auth/login").send({ email: "demo.corporate@ascenta.local", password: "AscentaDemo!2026" }).expect(200);
    expect(login.body.data.user.organizationIds).toEqual(["10000000-0000-4000-8000-000000000001"]);
    expect(login.body.data.user.emailVerified).toBe(true);
    const session = await agent.get("/api/v1/auth/me").expect(200);
    expect(session.body.data.user).toEqual(login.body.data.user);
    expect(session.body.data.user).not.toHaveProperty("passwordHash");
  });

  it("keeps personal requests private and rejects an unrelated organization", async () => {
    const login = await agent.post("/api/v1/auth/login").send({ email: "demo.customer@ascenta.local", password: "AscentaDemo!2026" }).expect(200);
    const input = { serviceTypeCode: "ONE_WAY", vehicleClassCode: "EXECUTIVE_SUV", pickupAddress: "A valid pickup", destinationAddress: "A valid destination", scheduledAt: "2026-11-22T15:30:00-05:00", scheduledTimeZone: "America/New_York", passengerCount: 1, notes: "Private trip details", idempotencyKey: "private-reservation-001" };
    await agent.post("/api/v1/reservations").set("x-csrf-token", login.body.data.csrfToken).send(input).expect(201);
    await agent.post("/api/v1/reservations").set("x-csrf-token", login.body.data.csrfToken).send({ ...input, idempotencyKey: "forbidden-company-001", organizationId: "10000000-0000-4000-8000-000000000001" }).expect(403);
    await operationsAgent.post("/api/v1/auth/login").send({ email: "demo.corporate@ascenta.local", password: "AscentaDemo!2026" }).expect(200);
    const list = await operationsAgent.get("/api/v1/reservations").expect(200);
    expect(list.body.data).toEqual([]);
  });
});
