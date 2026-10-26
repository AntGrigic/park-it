import type { DiscPoints, Player } from './player';
import { rankPlayers, summarize } from './ranking';

function player(id: string, ...attempts: DiscPoints[][]): Player {
  const padded = [...attempts, [null, null, null], [null, null, null]].slice(0, 3);
  return {
    id,
    name: id,
    division: null,
    pdgaNumber: null,
    attempts: padded.map((discs) => ({ discs })),
  };
}

describe('rankPlayers', () => {
  it('orders players by the total of all attempts, lowest first', () => {
    const board = rankPlayers([
      player('Cara', [100, 100, 100], [100, 100, 100], [100, 100, 100]),
      player('Ana', [10, 20, 30], [10, 10, 10], [5, 5, 5]),
      // Ben has the best single attempt (3) but the worst total.
      player('Ben', [300, 300, 300], [40, 40, 40], [1, 1, 1]),
    ]);
    expect(board.map((entry) => [entry.name, entry.rank, entry.total])).toEqual([
      ['Ana', 1, 105],
      ['Cara', 2, 900],
      ['Ben', 3, 1023],
    ]);
  });

  it('breaks equal totals with the better single attempt and shares rank on a full tie', () => {
    const board = rankPlayers([
      player('Ana', [50, 50, 50], [50, 50, 50], [50, 50, 50]),
      player('Ben', [10, 10, 10], [100, 100, 100], [40, 40, 40]),
      player('Cara', [10, 10, 10], [100, 100, 100], [40, 40, 40]),
    ]);
    expect(board.map((entry) => [entry.name, entry.rank, entry.total])).toEqual([
      ['Ben', 1, 450],
      ['Cara', 1, 450],
      ['Ana', 3, 450],
    ]);
  });

  it('lists players who have not finished every attempt last, unranked, with a running total', () => {
    const board = rankPlayers([
      player('Zed', [5, 5, 5], [5, 5, 5], [5, 5, null]),
      player('Ana', [100, 100, 100], [100, 100, 100], [100, 100, 100]),
    ]);
    expect(board.map((entry) => [entry.name, entry.rank, entry.total])).toEqual([
      ['Ana', 1, 900],
      ['Zed', null, null],
    ]);
    expect(board[1]).toMatchObject({ runningTotal: 40, discsThrown: 8 });
    expect(board[1].attempts[2]).toEqual({ discs: [5, 5, null], thrown: 2, total: null });
  });
});

describe('summarize', () => {
  it('reports the leader and the closest single disc', () => {
    const players = [
      player('Ana', [40, 40, 40], [40, 40, 40], [40, 40, 40]),
      player('Ben', [3, 280, 300], [10, 10, 10], [10, 10, 10]),
    ];
    expect(summarize(players, rankPlayers(players))).toEqual({
      players: 2,
      completedAttempts: 6,
      leader: { name: 'Ana', score: 360 },
      closestDisc: { name: 'Ben', points: 3 },
    });
  });
});
