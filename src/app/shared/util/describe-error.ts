import { DomainError } from '../domain/domain-error';

const FRIENDLY_CODES: Record<string, string> = {
  'auth/invalid-credential': 'Wrong email or password.',
  'auth/invalid-email': 'That email address looks off.',
  'auth/user-disabled': 'This account has been disabled.',
  'auth/too-many-requests': 'Too many attempts. Please wait a moment and try again.',
  'auth/network-request-failed': 'No connection. Check your network and try again.',
  'auth/popup-closed-by-user': 'Google sign-in was closed before it finished.',
  'auth/cancelled-popup-request': 'Google sign-in was closed before it finished.',
  'auth/popup-blocked': 'The Google sign-in window was blocked. Allow pop-ups for this site.',
  'auth/unauthorized-domain':
    'This site is not an authorized domain in Firebase Authentication → Settings.',
  'auth/operation-not-allowed': 'This sign-in method is not enabled in Firebase Authentication.',
  'auth/account-exists-with-different-credential':
    'This email already signs in with a different method.',
  'permission-denied': 'You do not have permission to change the board.',
  unavailable: 'The database is unreachable right now. Try again shortly.',
};

/** Turns any thrown value into a message that is safe and useful to show the user. */
export function describeError(error: unknown): string {
  if (error instanceof DomainError) {
    return error.message;
  }
  const code = typeof error === 'object' && error !== null && 'code' in error ? error.code : null;
  if (typeof code === 'string' && code in FRIENDLY_CODES) {
    return FRIENDLY_CODES[code];
  }
  return 'Something went wrong. Please try again.';
}
