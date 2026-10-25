import { DomainError } from '../../../shared/domain/domain-error';
import { PARK_IT_RULES } from './park-it.rules';
import { toDiscPoints } from './scoring';

export type PlayerId = string;

/**
 * Points for a single disc: its distance to the pin in centimetres, capped at
 * {@link PARK_IT_RULES.maxDiscPoints}. `null` means the disc has not been thrown yet.
 */
export type DiscPoints = number | null;

export interface Attempt {
  readonly discs: readonly DiscPoints[];
}

export interface PlayerDraft {
  readonly name: string;
  readonly attempts: readonly Attempt[];
}

export interface Player extends PlayerDraft {
  readonly id: PlayerId;
}

export const PLAYER_NAME_MAX_LENGTH = 40;

export function normalizePlayerName(raw: string): string {
  return raw.trim().replace(/\s+/g, ' ');
}

export function isValidPlayerName(raw: string): boolean {
  const name = normalizePlayerName(raw);
  return name.length > 0 && name.length <= PLAYER_NAME_MAX_LENGTH;
}

/** Names are unique on the board, ignoring case and extra whitespace. */
export function isNameTaken(players: readonly Player[], raw: string, exceptId?: PlayerId): boolean {
  const key = normalizePlayerName(raw).toLocaleLowerCase();
  return players.some(
    (player) => player.id !== exceptId && player.name.toLocaleLowerCase() === key,
  );
}

export function emptyAttempts(): Attempt[] {
  return Array.from({ length: PARK_IT_RULES.attemptsPerPlayer }, () => ({
    discs: Array.from({ length: PARK_IT_RULES.discsPerAttempt }, () => null),
  }));
}

/** Coerces any stored shape into exactly the configured attempts × discs with valid points. */
export function normalizeAttempts(
  raw: readonly { readonly discs?: readonly unknown[] }[] | null | undefined,
): Attempt[] {
  return emptyAttempts().map((emptyAttempt, attemptIndex) => ({
    discs: emptyAttempt.discs.map((_emptyDisc, discIndex) =>
      toDiscPoints(raw?.[attemptIndex]?.discs?.[discIndex]),
    ),
  }));
}

/** Validates and normalizes a player before it is stored. */
export function toPlayerDraft(name: string, attempts: readonly Attempt[]): PlayerDraft {
  const normalized = normalizePlayerName(name);
  if (!isValidPlayerName(normalized)) {
    throw new DomainError(`A player name needs 1–${PLAYER_NAME_MAX_LENGTH} characters.`);
  }
  return { name: normalized, attempts: normalizeAttempts(attempts) };
}

export function createPlayerDraft(name: string): PlayerDraft {
  return toPlayerDraft(name, emptyAttempts());
}

/** Returns new attempts with one disc set to `points` (`null` clears it). */
export function recordDisc(
  attempts: readonly Attempt[],
  attemptIndex: number,
  discIndex: number,
  points: DiscPoints,
): Attempt[] {
  return attempts.map((attempt, currentAttemptIndex) =>
    currentAttemptIndex !== attemptIndex
      ? attempt
      : {
          discs: attempt.discs.map((disc, currentDiscIndex) =>
            currentDiscIndex === discIndex ? toDiscPoints(points) : disc,
          ),
        },
  );
}

export function sameDraft(first: PlayerDraft, second: PlayerDraft): boolean {
  return (
    first.name === second.name &&
    first.attempts.length === second.attempts.length &&
    first.attempts.every(
      (attempt, attemptIndex) =>
        attempt.discs.length === second.attempts[attemptIndex].discs.length &&
        attempt.discs.every(
          (disc, discIndex) => disc === second.attempts[attemptIndex].discs[discIndex],
        ),
    )
  );
}
