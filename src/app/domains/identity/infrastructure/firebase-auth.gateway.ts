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
import { doc, getDoc, type FirestoreError } from 'firebase/firestore';
import { catchError, from, Observable, of, switchMap } from 'rxjs';
import { FIREBASE_APP, FIRESTORE } from '../../../core/firebase/firebase';
import { DomainError } from '../../../shared/domain/domain-error';
import type { AdminSession, Credentials } from '../domain/admin-session';
import { AuthGateway } from '../domain/auth.gateway';

/**
 * Firebase Auth adapter. Who is an admin is decided by `firestore.rules` alone (an email
 * list in `adminEmails()`), so nothing about admins is stored in the database.
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
    ).pipe(
      // If the admin check cannot run (e.g. offline), show signed-out rather than end the stream.
      switchMap((user) =>
        user ? from(this.toSession(user)).pipe(catchError(() => of(null))) : of(null),
      ),
    );
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
        `${user.email ?? 'This account'} is not on the admin list. Add it to adminEmails() ` +
          `in the Firestore rules.`,
      );
    }
    return session;
  }

  /**
   * Asks the rules instead of the data: `adminAccess/{uid}` holds no documents and is
   * readable only by admins, so the read succeeds exactly when this user may write.
   */
  private async toSession(user: User): Promise<AdminSession> {
    const isAdmin = await getDoc(doc(this.firestore, 'adminAccess', user.uid)).then(
      () => true,
      (error: unknown) => {
        if ((error as FirestoreError).code === 'permission-denied') {
          return false;
        }
        throw error;
      },
    );
    return { uid: user.uid, email: user.email, isAdmin };
  }
}
