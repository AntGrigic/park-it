import { inject, Injectable } from '@angular/core';
import {
  getAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
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
    const session = await this.toSession(user);
    if (!session.isAdmin) {
      await signOut(this.auth);
      throw new DomainError('This account is not an admin of the board.');
    }
    return session;
  }

  signOut(): Promise<void> {
    return signOut(this.auth);
  }

  private async toSession(user: User): Promise<AdminSession> {
    const isAdmin = await getDoc(doc(this.firestore, 'admins', user.uid)).then(
      (snapshot) => snapshot.exists(),
      () => false,
    );
    return { uid: user.uid, email: user.email, isAdmin };
  }
}
