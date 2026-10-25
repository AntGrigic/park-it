import type { DiscPoints, Player, PlayerId } from './player';
import { attemptTotal, bestAttempt, discsThrown, playerTotal, runningTotal } from './scoring';

export interface AttemptSummary {
  readonly discs: readonly DiscPoints[];
  readonly thrown: number;
  /** `null` until all discs of the attempt are thrown. */
  readonly total: number | null;
}

export interface LeaderboardEntry {
  readonly playerId: PlayerId;
  readonly name: string;
  /** Competition rank (1, 2, 2, 4…); `null` until the player completes every attempt. */
  readonly rank: number | null;
  /** Final score — all attempts added up; `null` while the player is still playing. */
  readonly total: number | null;
  /** Sum of the discs thrown so far; equals `total` once the player is finished. */
  readonly runningTotal: number;
  readonly discsThrown: number;
  readonly attempts: readonly AttemptSummary[];
}

export interface LeaderboardStats {
  readonly players: number;
  readonly completedAttempts: number;
  readonly leader: { readonly name: string; readonly score: number } | null;
  readonly closestDisc: { readonly name: string; readonly points: number } | null;
}

interface RankedRow {
  readonly player: Player;
  readonly total: number | null;
  /** Best single attempt — breaks ties between equal totals. */
  readonly tiebreak: number;
  readonly runningTotal: number;
  readonly discsThrown: number;
}

/**
 * Orders players from best to worst by their total over all attempts (lowest first);
 * equal totals are split by the better single attempt. Players who have not finished
 * every attempt are listed after the ranked players, unranked, most discs thrown first.
 */
export function rankPlayers(players: readonly Player[]): LeaderboardEntry[] {
  const rows: RankedRow[] = players
    .map((player) => ({
      player,
      total: playerTotal(player.attempts),
      tiebreak: bestAttempt(player.attempts)?.total ?? Number.POSITIVE_INFINITY,
      runningTotal: runningTotal(player.attempts),
      discsThrown: player.attempts.reduce((sum, attempt) => sum + discsThrown(attempt), 0),
    }))
    .sort(compareRows);

  let rank: number | null = null;
  return rows.map((row, index) => {
    const previous = rows[index - 1];
    if (row.total === null) {
      rank = null;
    } else if (!previous || compareScores(previous, row) !== 0) {
      rank = index + 1;
    }
    return {
      playerId: row.player.id,
      name: row.player.name,
      rank,
      total: row.total,
      runningTotal: row.runningTotal,
      discsThrown: row.discsThrown,
      attempts: row.player.attempts.map((attempt) => ({
        discs: attempt.discs,
        thrown: discsThrown(attempt),
        total: attemptTotal(attempt),
      })),
    };
  });
}

export function summarize(
  players: readonly Player[],
  leaderboard: readonly LeaderboardEntry[],
): LeaderboardStats {
  const leader = leaderboard[0];
  let closestDisc: LeaderboardStats['closestDisc'] = null;
  let completedAttempts = 0;

  for (const player of players) {
    for (const attempt of player.attempts) {
      if (attemptTotal(attempt) !== null) {
        completedAttempts++;
      }
      for (const disc of attempt.discs) {
        if (disc !== null && (closestDisc === null || disc < closestDisc.points)) {
          closestDisc = { name: player.name, points: disc };
        }
      }
    }
  }

  return {
    players: players.length,
    completedAttempts,
    leader:
      leader?.total !== null && leader?.total !== undefined
        ? { name: leader.name, score: leader.total }
        : null,
    closestDisc,
  };
}

function compareRows(first: RankedRow, second: RankedRow): number {
  const firstRanked = first.total !== null;
  const secondRanked = second.total !== null;
  if (firstRanked !== secondRanked) {
    return firstRanked ? -1 : 1;
  }
  const byScore = firstRanked
    ? compareScores(first, second)
    : second.discsThrown - first.discsThrown || first.runningTotal - second.runningTotal;
  return byScore || first.player.name.localeCompare(second.player.name);
}

/** Compares two finished players: lower total wins, then the better single attempt. */
function compareScores(first: RankedRow, second: RankedRow): number {
  return (first.total ?? 0) - (second.total ?? 0) || first.tiebreak - second.tiebreak;
}
