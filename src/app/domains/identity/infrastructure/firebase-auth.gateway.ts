import { inject, Injectable } from '@angular/core';
import {
  getAuth,
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  type User,
} from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { from, Observable, of, switchMap } from 'rxjs';
import { FIREBASE_APP, FIRESTORE } from '../../../core/firebase/firebase';
import { DomainError } from '../../../shared/domain/domain-error';
import type { AdminSession, Credentials } from '../domain/admin-session';
import { AuthGateway } from '../domain/auth.gateway';

/**
 * Firebase Auth adapter. A user is an admin when a document `admins/{uid}` exists,
 * which is the same check `firestore.rules` uses to allow writes.
 */
@Injectable()
export class FirebaseAuthGateway extends AuthGateway {
  readonly demoCredentials = null;
  private readonly auth = getAuth(inject(FIREBASE_APP));
  private readonly firestore = inject(FIRESTORE);

  session(): Observable<AdminSession | null> {
    return new Observable<User | null>((subscriber) =>
      onAuthStateChanged(
        this.auth,
        (user) => subscriber.next(user),
        (error) => subscriber.error(error),
      ),
    ).pipe(switchMap((user) => (user ? from(this.toSession(user)) : of(null))));
  }

  async signIn({ email, password }: Credentials): Promise<AdminSession> {
    const { user } = await signInWithEmailAndPassword(this.auth, email, password);
    return this.requireAdmin(user);
  }

  async signInWithGoogle(): Promise<AdminSession> {
    // A popup (not a redirect) works on GitHub Pages, which is not Firebase Hosting.
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });
    const { user } = await signInWithPopup(this.auth, provider);
    return this.requireAdmin(user);
  }

  signOut(): Promise<void> {
    return signOut(this.auth);
  }

  /** Keeps the session only for admins; anyone else is signed straight back out. */
  private async requireAdmin(user: User): Promise<AdminSession> {
    const session = await this.toSession(user);
    if (!session.isAdmin) {
      await signOut(this.auth);
      throw new DomainError(
        `${user.email ?? 'This account'} is not an admin yet. To give it access, add a ` +
          `Firestore document admins/${user.uid}.`,
      );
    }
    return session;
  }

  private async toSession(user: User): Promise<AdminSession> {
    const isAdmin = await getDoc(doc(this.firestore, 'admins', user.uid)).then(
      (snapshot) => snapshot.exists(),
      () => false,
    );
    return { uid: user.uid, email: user.email, isAdmin };
  }
}
