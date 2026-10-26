import { computed, inject } from '@angular/core';
import {
  patchState,
  signalStore,
  withComputed,
  withHooks,
  withMethods,
  withProps,
  withState,
} from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { catchError, of, pipe, switchMap, tap } from 'rxjs';
import { describeError } from '../../../shared/util/describe-error';
import type { AdminSession, Credentials } from '../domain/admin-session';
import { AuthGateway } from '../domain/auth.gateway';

type AuthStatus = 'checking' | 'signed-out' | 'signed-in';

interface AuthState {
  readonly session: AdminSession | null;
  readonly status: AuthStatus;
  readonly pending: boolean;
  readonly error: string | null;
}

const initialState: AuthState = { session: null, status: 'checking', pending: false, error: null };

/** Provided by the admin routes so Firebase Auth only loads with the admin area. */
export const AuthStore = signalStore(
  withState(initialState),
  withProps(() => {
    const gateway = inject(AuthGateway);
    return { _gateway: gateway, demoCredentials: gateway.demoCredentials };
  }),
  withComputed(({ session }) => ({
    isAdmin: computed(() => session()?.isAdmin === true),
    email: computed(() => session()?.email ?? null),
  })),
  withMethods((store) => {
    /** Runs a sign-in, keeping `pending` and `error` in sync. Resolves to whether it worked. */
    const runSignIn = async (signIn: () => Promise<AdminSession>): Promise<boolean> => {
      patchState(store, { pending: true, error: null });
      try {
        const session = await signIn();
        patchState(store, { session, status: 'signed-in', pending: false });
        return true;
      } catch (error) {
        patchState(store, { pending: false, error: describeError(error) });
        return false;
      }
    };

    return {
      _watch: rxMethod<void>(
        pipe(
          switchMap(() => store._gateway.session().pipe(catchError(() => of(null)))),
          tap((session) =>
            patchState(store, { session, status: session ? 'signed-in' : 'signed-out' }),
          ),
        ),
      ),

      signIn: (credentials: Credentials) => runSignIn(() => store._gateway.signIn(credentials)),

      signInWithGoogle: () => runSignIn(() => store._gateway.signInWithGoogle()),

      async signOut(): Promise<void> {
        await store._gateway.signOut();
        patchState(store, { session: null, status: 'signed-out' });
      },

      clearError(): void {
        patchState(store, { error: null });
      },
    };
  }),
  withHooks({
    onInit: (store) => store._watch(),
  }),
);
