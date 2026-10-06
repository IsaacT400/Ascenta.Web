import type { CatalogView, ReservationCreateInput, ReservationView, Role } from "@ascenta/shared";

export type RepositoryUser = {
  id: string;
  email: string;
  displayName: string;
  passwordHash: string;
  roles: Role[];
  organizationIds: string[];
  emailVerified: boolean;
};

export type RepositorySession = {
  user: RepositoryUser;
  tokenHash: string;
  csrfTokenHash: string;
  expiresAt: Date;
  revokedAt?: Date;
};

export interface AscentaRepository {
  health(): Promise<void>;
  findUserByEmail(email: string): Promise<RepositoryUser | null>;
  registerUser(input: { email: string; displayName: string; passwordHash: string; tokenHash: string; expiresAt: Date }): Promise<"created" | "exists">;
  verifyEmail(tokenHash: string): Promise<boolean>;
  createSession(input: { userId: string; tokenHash: string; csrfTokenHash: string; expiresAt: Date }): Promise<void>;
  findSession(tokenHash: string): Promise<RepositorySession | null>;
  revokeSession(tokenHash: string): Promise<void>;
  getCatalog(): Promise<CatalogView>;
  listReservations(user: RepositoryUser): Promise<ReservationView[]>;
  listOperationsReservations(): Promise<ReservationView[]>;
  createReservation(user: RepositoryUser, input: ReservationCreateInput): Promise<ReservationView>;
  close?(): Promise<void>;
}
