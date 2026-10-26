import type { Observable } from 'rxjs';
import type { AdminSession, Credentials } from './admin-session';

/** Port for authentication. Infrastructure provides Firebase Auth or the demo adapter. */
export abstract class AuthGateway {
  /** Credentials to offer on the sign-in screen; only set in demo mode. */
  abstract readonly demoCredentials: Credentials | null;
  /** Emits the current session, `null` when signed out, and again on every change. */
  abstract session(): Observable<AdminSession | null>;
  /** Signs in and resolves with an admin session, or rejects if the account is not an admin. */
  abstract signIn(credentials: Credentials): Promise<AdminSession>;
  /** Signs in with a Google account; same admin check as {@link signIn}. */
  abstract signInWithGoogle(): Promise<AdminSession>;
  abstract signOut(): Promise<void>;
}
