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

/** What an admin edits on a player's score sheet. */
export interface ScoreSheet {
  readonly name: string;
  readonly attempts: readonly Attempt[];
}

/** Event registration details; `null` when unknown. */
export interface PlayerProfile {
  /** Division code such as MPO, FPO or RAD. */
  readonly division: string | null;
  readonly pdgaNumber: string | null;
}

export interface PlayerDraft extends ScoreSheet, PlayerProfile {}

export interface Player extends PlayerDraft {
  readonly id: PlayerId;
}

export const PLAYER_NAME_MAX_LENGTH = 40;
const DIVISION_MAX_LENGTH = 10;

export function normalizePlayerName(raw: string): string {
  return raw.trim().replace(/\s+/g, ' ');
}

export function isValidPlayerName(raw: string): boolean {
  const name = normalizePlayerName(raw);
  return name.length > 0 && name.length <= PLAYER_NAME_MAX_LENGTH;
}

/** Upper-cased division code, or `null` when blank or not a short code. */
export function normalizeDivision(raw: unknown): string | null {
  const division = typeof raw === 'string' ? raw.trim().toUpperCase() : '';
  return division && division.length <= DIVISION_MAX_LENGTH ? division : null;
}

/** PDGA numbers are kept as digit strings; anything else becomes `null`. */
export function normalizePdgaNumber(raw: unknown): string | null {
  const pdgaNumber = typeof raw === 'number' || typeof raw === 'string' ? String(raw).trim() : '';
  return /^\d{1,9}$/.test(pdgaNumber) ? pdgaNumber : null;
}

const PDGA_PROFILE_URL = 'https://www.pdga.com/player/';

/** The player's public profile on pdga.com. */
export function pdgaProfileUrl(pdgaNumber: string): string {
  return `${PDGA_PROFILE_URL}${encodeURIComponent(pdgaNumber)}`;
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

/** Validates and normalizes a score sheet before it is stored. */
export function toScoreSheet(name: string, attempts: readonly Attempt[]): ScoreSheet {
  const normalized = normalizePlayerName(name);
  if (!isValidPlayerName(normalized)) {
    throw new DomainError(`A player name needs 1–${PLAYER_NAME_MAX_LENGTH} characters.`);
  }
  return { name: normalized, attempts: normalizeAttempts(attempts) };
}

export interface NewPlayer {
  readonly name: string;
  readonly division?: string | null;
  readonly pdgaNumber?: string | null;
  readonly attempts?: readonly Attempt[];
}

/** Builds a valid new player; attempts start empty unless given. */
export function createPlayerDraft({
  name,
  division = null,
  pdgaNumber = null,
  attempts = emptyAttempts(),
}: NewPlayer): PlayerDraft {
  return {
    ...toScoreSheet(name, attempts),
    division: normalizeDivision(division),
    pdgaNumber: normalizePdgaNumber(pdgaNumber),
  };
}

/** Same person: matched by PDGA number when both have one, otherwise by name. */
export function isSamePlayer(player: PlayerDraft, other: PlayerDraft): boolean {
  if (player.pdgaNumber && other.pdgaNumber) {
    return player.pdgaNumber === other.pdgaNumber;
  }
  return player.name.toLocaleLowerCase() === other.name.toLocaleLowerCase();
}

/** Roster entries that are not on the board yet. */
export function findMissingPlayers(
  board: readonly Player[],
  roster: readonly PlayerDraft[],
): PlayerDraft[] {
  return roster.filter((entry) => !board.some((player) => isSamePlayer(player, entry)));
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

export function sameScoreSheet(first: ScoreSheet, second: ScoreSheet): boolean {
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
