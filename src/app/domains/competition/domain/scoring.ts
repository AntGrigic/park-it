import { PARK_IT_RULES } from './park-it.rules';
import type { Attempt, DiscPoints } from './player';

/**
 * Converts a measured distance to the pin (cm) into points: one point per centimetre,
 * capped at {@link PARK_IT_RULES.maxDiscPoints} for anything outside 3 m.
 * Blank or non-numeric input means the disc has not been thrown yet.
 */
export function toDiscPoints(distanceCm: unknown): DiscPoints {
  if (distanceCm === null || distanceCm === undefined || distanceCm === '') {
    return null;
  }
  const value = typeof distanceCm === 'number' ? distanceCm : Number(distanceCm);
  if (!Number.isFinite(value)) {
    return null;
  }
  return Math.min(PARK_IT_RULES.maxDiscPoints, Math.max(0, Math.round(value)));
}

export function discsThrown(attempt: Attempt): number {
  return attempt.discs.filter((disc) => disc !== null).length;
}

export function isAttemptComplete(attempt: Attempt): boolean {
  return discsThrown(attempt) === PARK_IT_RULES.discsPerAttempt;
}

/** Sum of the attempt's discs, or `null` while the attempt is still in progress. */
export function attemptTotal(attempt: Attempt): number | null {
  if (!isAttemptComplete(attempt)) {
    return null;
  }
  return attempt.discs.reduce<number>((sum, disc) => sum + (disc ?? 0), 0);
}

/** Sum of every disc thrown so far — the live score while a player is still playing. */
export function runningTotal(attempts: readonly Attempt[]): number {
  return attempts.reduce(
    (sum, attempt) =>
      sum + attempt.discs.reduce<number>((attemptSum, disc) => attemptSum + (disc ?? 0), 0),
    0,
  );
}

/** A player's score: all attempts added up, or `null` until every attempt is complete. */
export function playerTotal(attempts: readonly Attempt[]): number | null {
  return attempts.every(isAttemptComplete) ? runningTotal(attempts) : null;
}

export interface BestAttempt {
  readonly index: number;
  readonly total: number;
}

/** The lowest-scoring completed attempt — used to break ties between equal totals. */
export function bestAttempt(attempts: readonly Attempt[]): BestAttempt | null {
  let best: BestAttempt | null = null;
  for (const [index, attempt] of attempts.entries()) {
    const total = attemptTotal(attempt);
    if (total !== null && (best === null || total < best.total)) {
      best = { index, total };
    }
  }
  return best;
}
