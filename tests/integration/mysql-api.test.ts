import request from "supertest";
import { afterAll, describe, expect, it } from "vitest";

import { createApp } from "../../apps/api/src/app.js";
import type { AppConfig } from "../../apps/api/src/config.js";
import { MySqlRepository } from "../../apps/api/src/mysql-repository.js";

const runMySql = Boolean(process.env.TEST_DATABASE_URL);
const repository = runMySql ? new MySqlRepository() : undefined;
const config: AppConfig = { nodeEnv: "test", port: 4000, webOrigin: "http://localhost:5173", sessionCookieName: "ascenta_session", csrfCookieName: "ascenta_csrf", sessionTtlHours: 12, dataMode: "mysql", trustProxy: false };

describe.skipIf(!runMySql)("Ascenta API with MySQL", () => {
  const customer = request.agent(createApp({ repository: repository!, config }));
  const corporate = request.agent(createApp({ repository: repository!, config }));

  afterAll(async () => { await repository?.close?.(); });

  it("persists a reservation and isolates it from another account", async () => {
    const login = await customer.post("/api/v1/auth/login").send({ email: "demo.customer@ascenta.local", password: "AscentaDemo!2026" }).expect(200);
    const key = `mysql-integration-${Date.now()}`;
    const created = await customer.post("/api/v1/reservations").set("x-csrf-token", login.body.data.csrfToken).send({
      serviceTypeCode: "ONE_WAY", vehicleClassCode: "EXECUTIVE_SUV", pickupAddress: "100 Demo Street, New York, NY", destinationAddress: "200 Example Avenue, New York, NY", scheduledAt: "2026-11-01T01:30:00-04:00", scheduledTimeZone: "America/New_York", passengerCount: 1, idempotencyKey: key,
    }).expect(201);
    const visible = await customer.get("/api/v1/reservations").expect(200);
    expect(visible.body.data.some((item: { id: string }) => item.id === created.body.data.id)).toBe(true);

    await corporate.post("/api/v1/auth/login").send({ email: "demo.corporate@ascenta.local", password: "AscentaDemo!2026" }).expect(200);
    const isolated = await corporate.get("/api/v1/reservations").expect(200);
    expect(isolated.body.data.some((item: { id: string }) => item.id === created.body.data.id)).toBe(false);
  });
});
