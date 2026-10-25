import { inject } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { type CanActivateFn, Router } from '@angular/router';
import { filter, map, take } from 'rxjs';
import { AuthStore } from './auth.store';

/** Waits until the initial auth check is done, then reports whether the user is an admin. */
function resolvedIsAdmin() {
  const auth = inject(AuthStore);
  return toObservable(auth.status).pipe(
    filter((status) => status !== 'checking'),
    take(1),
    map(() => auth.isAdmin()),
  );
}

export const adminGuard: CanActivateFn = () => {
  const router = inject(Router);
  return resolvedIsAdmin().pipe(
    map((isAdmin) => isAdmin || router.createUrlTree(['/admin/login'])),
  );
};

export const guestGuard: CanActivateFn = () => {
  const router = inject(Router);
  return resolvedIsAdmin().pipe(
    map((isAdmin) => (isAdmin ? router.createUrlTree(['/admin']) : true)),
  );
};
