/**
 * The rules of Park it!
 *
 * Every player gets {@link attemptsPerPlayer} attempts. In each attempt they throw
 * {@link discsPerAttempt} discs at the pin. A disc scores one point per centimetre
 * from the pin, and anything outside 3 m scores {@link maxDiscPoints}.
 * An attempt's score is the sum of its discs; a player's score is all attempts
 * added up. Lowest score wins.
 */
export const PARK_IT_RULES = {
  attemptsPerPlayer: 3,
  discsPerAttempt: 3,
  /** Points for a disc outside the 3 m circle — also the cap for any single disc. */
  maxDiscPoints: 300,
} as const;
