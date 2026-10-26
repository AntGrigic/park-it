import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { DomainError } from '../../../shared/domain/domain-error';
import type { AdminSession, Credentials } from '../domain/admin-session';
import { AuthGateway } from '../domain/auth.gateway';

/** Demo-mode admin. Only unlocks the board stored in this browser — not a real account. */
const DEMO_ADMIN: Credentials = { email: 'admin@parkit.demo', password: 'parkit-demo' };
const SESSION_KEY = 'park-it.demo-session';

@Injectable()
export class DemoAuthGateway extends AuthGateway {
  readonly demoCredentials = DEMO_ADMIN;
  private readonly session$ = new BehaviorSubject<AdminSession | null>(this.restore());

  session(): Observable<AdminSession | null> {
    return this.session$.asObservable();
  }

  async signIn({ email, password }: Credentials): Promise<AdminSession> {
    await new Promise((resolve) => setTimeout(resolve, 400));
    if (email.trim().toLowerCase() !== DEMO_ADMIN.email || password !== DEMO_ADMIN.password) {
      throw new DomainError('Wrong email or password.');
    }
    return this.startSession();
  }

  /** There is no Google in demo mode: signs in as the demo admin. */
  async signInWithGoogle(): Promise<AdminSession> {
    await new Promise((resolve) => setTimeout(resolve, 400));
    return this.startSession();
  }

  private startSession(): AdminSession {
    const session: AdminSession = { uid: 'demo-admin', email: DEMO_ADMIN.email, isAdmin: true };
    this.persist(true);
    this.session$.next(session);
    return session;
  }

  async signOut(): Promise<void> {
    this.persist(false);
    this.session$.next(null);
  }

  private restore(): AdminSession | null {
    try {
      return sessionStorage.getItem(SESSION_KEY)
        ? { uid: 'demo-admin', email: DEMO_ADMIN.email, isAdmin: true }
        : null;
    } catch {
      return null;
    }
  }

  private persist(signedIn: boolean): void {
    try {
      if (signedIn) {
        sessionStorage.setItem(SESSION_KEY, '1');
      } else {
        sessionStorage.removeItem(SESSION_KEY);
      }
    } catch {
      // Session survives only in memory when storage is blocked.
    }
  }
}
