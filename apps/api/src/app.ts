import { randomUUID } from "node:crypto";
import { compare, hash } from "bcryptjs";
import cookieParser from "cookie-parser";
import cors from "cors";
import express, { type NextFunction, type Request, type Response } from "express";
import { rateLimit } from "express-rate-limit";
import helmet from "helmet";
import { ZodError } from "zod";

import { loginInputSchema, registerInputSchema, reservationCreateInputSchema, type SessionView } from "@ascenta/shared";
import type { AppConfig } from "./config.js";
import { HttpError } from "./http-error.js";
import type { AscentaRepository } from "./repository.js";
import { hashToken, randomToken, tokenMatches } from "./security.js";

type AppDependencies = { repository: AscentaRepository; config: AppConfig };

export function createApp({ repository, config }: AppDependencies) {
  const app = express();
  app.disable("x-powered-by");
  if (config.trustProxy) app.set("trust proxy", 1);
  app.use(helmet());
  app.use(cors({ origin: config.webOrigin, credentials: true, methods: ["GET", "POST", "OPTIONS"], allowedHeaders: ["Content-Type", "X-CSRF-Token", "X-Request-Id"] }));
  app.use(express.json({ limit: "128kb" }));
  app.use(cookieParser());
  app.use((req, res, next) => {
    req.requestId = typeof req.header("x-request-id") === "string" ? req.header("x-request-id")!.slice(0, 64) : randomUUID();
    res.setHeader("x-request-id", req.requestId);
    next();
  });

  const loginLimiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 20, standardHeaders: "draft-8", legacyHeaders: false });

  const authenticate = async (req: Request, _res: Response, next: NextFunction) => {
    try {
      const token = req.cookies[config.sessionCookieName] as string | undefined;
      if (!token) throw new HttpError(401, "AUTH_REQUIRED", "Sign in is required.");
      const session = await repository.findSession(hashToken(token));
      if (!session) throw new HttpError(401, "SESSION_INVALID", "The session is invalid or has expired.");
      req.ascentaSession = session;
      next();
    } catch (error) { next(error); }
  };

  const verifyCsrf = (req: Request, _res: Response, next: NextFunction) => {
    const token = req.header("x-csrf-token");
    if (!token || !req.ascentaSession || !tokenMatches(token, req.ascentaSession.csrfTokenHash)) return next(new HttpError(403, "CSRF_INVALID", "The request could not be verified."));
    next();
  };

  app.get("/api/v1/health", async (req, res) => {
    try {
      await repository.health();
      res.json({ data: { status: "ok", dataMode: config.dataMode }, requestId: req.requestId });
    } catch {
      res.status(503).json({ error: { code: "DEPENDENCY_UNAVAILABLE", message: "The data service is unavailable.", requestId: req.requestId } });
    }
  });

  app.post("/api/v1/auth/login", loginLimiter, async (req, res, next) => {
    try {
      const input = loginInputSchema.parse(req.body);
      const user = await repository.findUserByEmail(input.email);
      if (!user || !(await compare(input.password, user.passwordHash))) throw new HttpError(401, "CREDENTIALS_INVALID", "Email or password is incorrect.");
      if (!user.emailVerified) throw new HttpError(403, "EMAIL_NOT_VERIFIED", "Verify your email before signing in.");
      const sessionToken = randomToken();
      const csrfToken = randomToken();
      const expiresAt = new Date(Date.now() + config.sessionTtlHours * 60 * 60 * 1000);
      await repository.createSession({ userId: user.id, tokenHash: hashToken(sessionToken), csrfTokenHash: hashToken(csrfToken), expiresAt });
      res.cookie(config.sessionCookieName, sessionToken, { httpOnly: true, secure: config.nodeEnv === "production", sameSite: "strict", path: "/", expires: expiresAt });
      res.cookie(config.csrfCookieName, csrfToken, { httpOnly: false, secure: config.nodeEnv === "production", sameSite: "strict", path: "/", expires: expiresAt });
      const view: SessionView = { user: { id: user.id, email: user.email, displayName: user.displayName, roles: user.roles }, csrfToken };
      res.json({ data: view, requestId: req.requestId });
    } catch (error) { next(error); }
  });

  app.post("/api/v1/auth/register", loginLimiter, async (req, res, next) => {
    try {
      if (config.nodeEnv === "production") throw new HttpError(503, "REGISTRATION_UNAVAILABLE", "Account registration is unavailable until an email delivery service is configured.");
      const input = registerInputSchema.parse(req.body);
      const verificationToken = randomToken();
      const result = await repository.registerUser({
        email: input.email,
        displayName: input.displayName,
        passwordHash: await hash(input.password, 12),
        tokenHash: hashToken(verificationToken),
        expiresAt: new Date(Date.now() + 30 * 60 * 1000),
      });
      const localToken = result === "created" ? verificationToken : undefined;
      res.status(202).json({ data: { status: "verification_required", localVerificationToken: localToken, delivery: "local_only" }, requestId: req.requestId });
    } catch (error) { next(error); }
  });

  app.post("/api/v1/auth/verify-email", async (req, res, next) => {
    try {
      const token = typeof req.body?.token === "string" ? req.body.token : "";
      if (token.length < 32 || token.length > 256 || !(await repository.verifyEmail(hashToken(token)))) throw new HttpError(400, "VERIFICATION_INVALID", "This verification link is invalid or expired.");
      res.json({ data: { status: "verified" }, requestId: req.requestId });
    } catch (error) { next(error); }
  });

  app.get("/api/v1/auth/me", authenticate, (req, res) => {
    const user = req.ascentaSession!.user;
    res.json({ data: { user: { id: user.id, email: user.email, displayName: user.displayName, roles: user.roles } }, requestId: req.requestId });
  });

  app.post("/api/v1/auth/logout", authenticate, verifyCsrf, async (req, res, next) => {
    try {
      await repository.revokeSession(req.ascentaSession!.tokenHash);
      res.clearCookie(config.sessionCookieName, { httpOnly: true, secure: config.nodeEnv === "production", sameSite: "strict", path: "/" });
      res.clearCookie(config.csrfCookieName, { httpOnly: false, secure: config.nodeEnv === "production", sameSite: "strict", path: "/" });
      res.status(204).end();
    } catch (error) { next(error); }
  });

  app.get("/api/v1/catalog", async (req, res, next) => {
    try { res.json({ data: await repository.getCatalog(), requestId: req.requestId }); } catch (error) { next(error); }
  });

  app.get("/api/v1/reservations", authenticate, async (req, res, next) => {
    try { res.json({ data: await repository.listReservations(req.ascentaSession!.user), requestId: req.requestId }); } catch (error) { next(error); }
  });

  app.get("/api/v1/admin/reservations", authenticate, async (req, res, next) => {
    try {
      if (!req.ascentaSession!.user.roles.includes("ASCENTA_ADMIN")) throw new HttpError(403, "FORBIDDEN", "Operations access is required.");
      res.json({ data: await repository.listOperationsReservations(), requestId: req.requestId });
    } catch (error) { next(error); }
  });

  app.post("/api/v1/reservations", authenticate, verifyCsrf, async (req, res, next) => {
    try {
      const input = reservationCreateInputSchema.parse(req.body);
      const reservation = await repository.createReservation(req.ascentaSession!.user, input);
      res.status(201).json({ data: reservation, requestId: req.requestId });
    } catch (error) { next(error); }
  });

  app.use((_req, _res, next) => next(new HttpError(404, "NOT_FOUND", "The requested endpoint does not exist.")));
  app.use((error: unknown, req: Request, res: Response, _next: NextFunction) => {
    if (error instanceof ZodError) {
      return res.status(422).json({ error: { code: "VALIDATION_FAILED", message: "The request contains invalid data.", requestId: req.requestId, details: error.flatten() } });
    }
    const candidate = error as { status?: number; code?: string; message?: string };
    const status = error instanceof HttpError ? error.status : candidate.status ?? 500;
    const code = error instanceof HttpError ? error.code : candidate.code ?? "INTERNAL_ERROR";
    const message = status >= 500 ? "An unexpected error occurred." : candidate.message ?? "The request could not be completed.";
    if (status >= 500 && config.nodeEnv !== "test") console.error(`[${req.requestId}]`, error);
    return res.status(status).json({ error: { code, message, requestId: req.requestId } });
  });

  return app;
}
