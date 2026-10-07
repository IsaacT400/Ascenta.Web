import { spawn, type ChildProcess } from "node:child_process";
import { randomUUID } from "node:crypto";
import { createServer } from "node:net";
import { fileURLToPath } from "node:url";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { createPrismaClient } from "../../packages/database/src/index.js";
import { seedCatalog } from "../../packages/database/prisma/seed-catalog.js";
import { DemoRepository } from "../../apps/api/src/demo-repository.js";

const runMySql = Boolean(process.env.TEST_DATABASE_URL);
const suiteId = randomUUID();
const emails = [`owner-${suiteId}@example.test`, `operator-${suiteId}@example.test`, `colleague-${suiteId}@example.test`, `outsider-${suiteId}@example.test`];
const password = `Integration-${randomUUID()}!`;
const organizationId = randomUUID();
const otherOrganizationId = randomUUID();
const wait = (milliseconds: number) => new Promise((resolve) => setTimeout(resolve, milliseconds));
type Login = { cookie: string; csrfToken: string };
type ApiBody = { data?: any; error?: { code: string } };

describe.skipIf(!runMySql)("Ascenta API with isolated MySQL and a real process restart", () => {
  let prisma: ReturnType<typeof createPrismaClient>;
  let server: ChildProcess | undefined;
  let serverOutput = "";
  let port: number;
  let owner: Login;
  let operator: Login;
  let colleague: Login;
  let outsider: Login;
  let reservationId: string;
  let reservationReference: string;
  let privateInput: Record<string, unknown>;

  async function call(path: string, options: { method?: string; body?: unknown; login?: Login; csrf?: string } = {}) {
    const headers: Record<string, string> = { "content-type": "application/json" };
    if (options.login) headers.cookie = options.login.cookie;
    if (options.csrf ?? options.login?.csrfToken) headers["x-csrf-token"] = options.csrf ?? options.login!.csrfToken;
    const response = await fetch(`http://127.0.0.1:${port}/api/v1${path}`, {
      method: options.method ?? "GET", headers,
      body: options.body === undefined ? undefined : JSON.stringify(options.body),
      signal: AbortSignal.timeout(5000),
    });
    const body: ApiBody = response.status === 204 ? {} : await response.json();
    return { status: response.status, body, cookies: response.headers.getSetCookie() };
  }

  async function startApi() {
    serverOutput = "";
    server = spawn(process.execPath, [fileURLToPath(new URL("../../apps/api/dist/server.js", import.meta.url))], {
      cwd: fileURLToPath(new URL("../../", import.meta.url)),
      env: { ...process.env, NODE_ENV: "test", DATA_MODE: "mysql", API_PORT: String(port), WEB_ORIGIN: "http://localhost:5175" },
      windowsHide: true, stdio: ["ignore", "pipe", "pipe"],
    });
    const capture = (chunk: Buffer) => { serverOutput = (serverOutput + chunk.toString()).slice(-6000); };
    server.stdout?.on("data", capture);
    server.stderr?.on("data", capture);
    let startupError: Error | undefined;
    server.on("error", (error) => { startupError = error; });
    for (let attempt = 0; attempt < 100; attempt++) {
      if (startupError || server.exitCode !== null) break;
      try {
        const health = await call("/health");
        if (health.status === 200 && health.body.data.dataMode === "mysql") return;
      } catch { /* Waiting for this child process to listen. */ }
      await wait(100);
    }
    throw new Error(`Test API did not start: ${startupError?.message ?? serverOutput.replace(/mysql:\/\/\S+/g, "mysql://[redacted]")}`);
  }

  async function stopApi() {
    if (!server || server.exitCode !== null) return;
    const processToStop = server;
    await new Promise<void>((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error("Test API did not stop.")), 10000);
      processToStop.once("exit", () => { clearTimeout(timer); resolve(); });
      processToStop.kill("SIGTERM");
    });
    server = undefined;
  }

  async function login(email: string): Promise<Login> {
    const response = await call("/auth/login", { method: "POST", body: { email, password } });
    expect(response.status).toBe(200);
    return { cookie: response.cookies.map((value) => value.split(";")[0]).join("; "), csrfToken: response.body.data.csrfToken };
  }

  beforeAll(async () => {
    if (process.env.NODE_ENV !== "test") {
      throw new Error("The MySQL integration suite requires NODE_ENV=test before creating any database client.");
    }
    prisma = createPrismaClient(); // Rejects any database whose name does not end in _test.
    const databases = await prisma.$queryRaw<Array<{ name: string }>>`SELECT DATABASE() AS name`;
    expect(databases[0]?.name).toBe(decodeURIComponent(new URL(process.env.TEST_DATABASE_URL!).pathname.slice(1)));
    expect(databases[0]?.name).toMatch(/_test$/);
    await seedCatalog(prisma);
    const probe = createServer();
    await new Promise<void>((resolve) => probe.listen(0, "127.0.0.1", resolve));
    port = (probe.address() as { port: number }).port;
    await new Promise<void>((resolve, reject) => probe.close((error) => error ? reject(error) : resolve()));
    await startApi();
  }, 30000);

  afterAll(async () => {
    await stopApi();
    if (!prisma) return;
    try {
      const users = await prisma.user.findMany({ where: { email: { in: emails } }, select: { id: true } });
      const ids = users.map((user) => user.id);
      await prisma.reservation.deleteMany({ where: { createdById: { in: ids } } });
      await prisma.user.deleteMany({ where: { id: { in: ids } } });
      await prisma.organization.deleteMany({ where: { id: { in: [organizationId, otherOrganizationId] } } });
    } finally { await prisma.$disconnect(); }
  }, 30000);

  it("preserves the reference catalog order for services and vehicle classes", async () => {
    const referenceCatalog = await new DemoRepository().getCatalog();
    const catalog = await call("/catalog");
    expect(catalog.status).toBe(200);
    expect(catalog.body.data.serviceTypes.map((item: { code: string }) => item.code)).toEqual(referenceCatalog.serviceTypes.map((item) => item.code));
    expect(catalog.body.data.vehicleClasses.map((item: { code: string }) => item.code)).toEqual(referenceCatalog.vehicleClasses.map((item) => item.code));
  });

  it("persists registration, verification, roles, and hashed sessions", async () => {
    expect((await call("/reservations")).status).toBe(401);
    for (const email of emails) {
      const registered = await call("/auth/register", { method: "POST", body: { email, displayName: "Integration Account", password, termsAccepted: true } });
      expect(registered.status).toBe(202);
      expect(registered.body.data.delivery).toBe("local_only");
      expect((await call("/auth/login", { method: "POST", body: { email, password } })).status).toBe(403);
      const token = registered.body.data.localVerificationToken;
      expect((await call("/auth/verify-email", { method: "POST", body: { token } })).status).toBe(200);
      expect((await call("/auth/verify-email", { method: "POST", body: { token } })).status).toBe(400);
    }
    await prisma.user.update({ where: { email: emails[1] }, data: { isAdmin: true, memberships: { create: { role: "CORPORATE_ADMIN", organization: { create: { id: organizationId, name: `Integration ${suiteId}` } } } } } });
    await prisma.user.update({ where: { email: emails[2] }, data: { memberships: { create: { role: "CORPORATE_BOOKER", organization: { connect: { id: organizationId } } } } } });
    await prisma.user.update({ where: { email: emails[3] }, data: { memberships: { create: { role: "CORPORATE_BOOKER", organization: { create: { id: otherOrganizationId, name: `Other integration ${suiteId}` } } } } } });
    owner = await login(emails[0]!);
    operator = await login(emails[1]!);
    colleague = await login(emails[2]!);
    outsider = await login(emails[3]!);
    const account = await prisma.user.findUniqueOrThrow({ where: { email: emails[0] }, include: { sessions: true } });
    expect(account.passwordHash).not.toBe(password);
    expect(account.sessions).toHaveLength(1);
    expect(account.sessions[0]!.tokenHash).toMatch(/^[a-f0-9]{64}$/);
    const view = await call("/auth/me", { login: owner });
    expect(view.body.data.user).not.toHaveProperty("passwordHash");
    expect((await call("/auth/me", { login: operator })).body.data.user.roles).toContain("CORPORATE_ADMIN");
  }, 30000);

  it("keeps private requests isolated and enforces CSRF, organization access and idempotency", async () => {
    privateInput = {
      serviceTypeCode: "ONE_WAY", vehicleClassCode: "EXECUTIVE_SUV",
      pickupAddress: "100 Integration Street", destinationAddress: "200 Integration Avenue",
      scheduledAt: new Date(Date.now() + 7 * 86400000).toISOString(), scheduledTimeZone: "America/New_York",
      passengerCount: 1, passengerName: "Integration Traveler", passengerEmail: "traveler@example.test",
      notes: "Persisted request; luggage: 2; flight: AA123", idempotencyKey: `mysql-${suiteId}`,
    };
    expect((await call("/reservations", { method: "POST", login: owner, csrf: "invalid", body: privateInput })).status).toBe(403);
    const created = await call("/reservations", { method: "POST", login: owner, body: privateInput });
    expect(created.status).toBe(201);
    reservationId = created.body.data.id;
    reservationReference = created.body.data.reference;
    expect(created.body.data.notes).toBe(privateInput.notes);
    expect(created.body.data.scheduledAt).toBe(privateInput.scheduledAt);
    const repeated = await call("/reservations", { method: "POST", login: owner, body: privateInput });
    expect(repeated.body.data.id).toBe(reservationId);
    expect((await call("/reservations", { method: "POST", login: owner, body: { ...privateInput, destinationAddress: "Different destination" } })).status).toBe(409);
    expect((await call("/reservations", { method: "POST", login: operator, body: privateInput })).status).toBe(409);
    expect((await call("/reservations", { method: "POST", login: owner, body: { ...privateInput, idempotencyKey: `forbidden-${suiteId}`, organizationId } })).status).toBe(403);
    expect((await call("/reservations", { login: operator })).body.data).toEqual([]);
    expect((await call("/admin/reservations", { login: owner })).status).toBe(403);
    expect((await call("/admin/reservations", { login: colleague })).status).toBe(403);
    const operations = await call("/admin/reservations", { login: operator });
    expect(operations.body.data.find((row: { id: string }) => row.id === reservationId).reference).toBe(reservationReference);
    const corporate = await call("/reservations", { method: "POST", login: operator, body: { ...privateInput, idempotencyKey: `corporate-${suiteId}`, organizationId } });
    expect(corporate.status).toBe(201);
    expect((await call("/reservations", { login: colleague })).body.data.map((row: { id: string }) => row.id)).toEqual([corporate.body.data.id]);
    expect((await call("/reservations", { login: outsider })).body.data).toEqual([]);
    expect((await call("/reservations", { method: "POST", login: colleague, body: { ...privateInput, idempotencyKey: `other-company-${suiteId}`, organizationId: otherOrganizationId } })).status).toBe(403);
    const bookerRequest = await call("/reservations", { method: "POST", login: colleague, body: { ...privateInput, idempotencyKey: `booker-${suiteId}`, organizationId } });
    expect(bookerRequest.status).toBe(201);
    expect((await call("/reservations", { login: operator })).body.data).toHaveLength(2);
    expect((await call("/reservations", { login: owner })).body.data.map((row: { id: string }) => row.id)).toEqual([reservationId]);
  });

  it("retains the request and existing session after stopping and restarting the API process", async () => {
    const originalPid = server!.pid;
    await stopApi();
    await startApi();
    expect(server!.pid).not.toBe(originalPid);
    const response = await call("/reservations", { login: owner });
    expect(response.status).toBe(200);
    const persisted = response.body.data.find((row: { id: string }) => row.id === reservationId);
    expect(persisted.reference).toBe(reservationReference);
    expect(persisted.notes).toBe(privateInput.notes);
    expect(persisted.scheduledAt).toBe(privateInput.scheduledAt);
    expect(await prisma.reservation.count({ where: { id: reservationId } })).toBe(1);
    expect((await call("/auth/logout", { method: "POST", login: owner })).status).toBe(204);
    expect((await call("/auth/me", { login: owner })).status).toBe(401);
  }, 30000);
});
