import { rankPlayers } from '../domain/ranking';
import { EVENT_PLAYERS, eventRoster, SAMPLE_THROWS_PLAYER_COUNT } from './event-roster';

describe('eventRoster', () => {
  it('turns every registered player into a valid draft with division and PDGA number', () => {
    const roster = eventRoster(false);
    expect(roster).toHaveLength(EVENT_PLAYERS.length);
    expect(roster.every((draft) => draft.division && draft.pdgaNumber)).toBe(true);
    expect(new Set(roster.map((draft) => draft.pdgaNumber)).size).toBe(roster.length);
  });

  it('has no throws unless sample throws are requested', () => {
    const thrown = (includeSampleThrows: boolean) =>
      eventRoster(includeSampleThrows).filter((draft) =>
        draft.attempts.some((attempt) => attempt.discs.some((disc) => disc !== null)),
      );
    expect(thrown(false)).toHaveLength(0);
    expect(thrown(true)).toHaveLength(SAMPLE_THROWS_PLAYER_COUNT);
  });

  it('ranks the sample throws with five finished players and two still playing', () => {
    const players = eventRoster(true).map((draft, index) => ({ id: String(index), ...draft }));
    const ranked = rankPlayers(players).filter((entry) => entry.discsThrown > 0);
    expect(
      ranked.map((entry) => [entry.name, entry.rank, entry.total ?? entry.runningTotal]),
    ).toEqual([
      ['Danica Pajtak', 1, 275],
      ['Ari Penttala', 2, 287],
      ['Antonio Grigić', 3, 347],
      ['Tinu Schär', 4, 397],
      ['Nino Durak', 5, 957],
      ['Cornelia Hackl', null, 515],
      ['Radule Raško Mikic', null, 155],
    ]);
  });
});
