import type { RepositorySession } from "./repository.js";

declare global {
  namespace Express {
    interface Request {
      requestId: string;
      ascentaSession?: RepositorySession;
    }
  }
}

export {};
