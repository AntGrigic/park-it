import { DomainError } from '../domain/domain-error';

const FRIENDLY_CODES: Record<string, string> = {
  'auth/invalid-credential': 'Wrong email or password.',
  'auth/invalid-email': 'That email address looks off.',
  'auth/user-disabled': 'This account has been disabled.',
  'auth/too-many-requests': 'Too many attempts. Please wait a moment and try again.',
  'auth/network-request-failed': 'No connection. Check your network and try again.',
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
