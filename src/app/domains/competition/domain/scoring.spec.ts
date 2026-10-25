import { recordDisc, emptyAttempts, normalizeAttempts, toPlayerDraft } from './player';
import { attemptTotal, bestAttempt, playerTotal, runningTotal, toDiscPoints } from './scoring';

describe('scoring', () => {
  describe('toDiscPoints', () => {
    it('scores one point per centimetre', () => {
      expect(toDiscPoints(10)).toBe(10);
      expect(toDiscPoints(200)).toBe(200);
    });

    it('caps anything outside 3 m at 300', () => {
      expect(toDiscPoints(300)).toBe(300);
      expect(toDiscPoints(450)).toBe(300);
    });

    it('rounds, clamps negatives and treats blanks as not thrown', () => {
      expect(toDiscPoints(12.6)).toBe(13);
      expect(toDiscPoints(-5)).toBe(0);
      expect(toDiscPoints('')).toBeNull();
      expect(toDiscPoints('abc')).toBeNull();
      expect(toDiscPoints(null)).toBeNull();
    });
  });

  it('totals an attempt only once all three discs are thrown', () => {
    expect(attemptTotal({ discs: [10, 20, null] })).toBeNull();
    expect(attemptTotal({ discs: [10, 20, 300] })).toBe(330);
  });

  it('adds up all attempts for the player score once every attempt is complete', () => {
    const maja = [{ discs: [42, 18, 65] }, { discs: [12, 30, 22] }, { discs: [88, 300, 41] }];
    expect(playerTotal(maja)).toBe(618); // 125 + 64 + 429
    expect(playerTotal([...maja.slice(0, 2), { discs: [88, 300, null] }])).toBeNull();
    expect(runningTotal([...maja.slice(0, 2), { discs: [88, 300, null] }])).toBe(577);
  });

  it('finds the lowest completed attempt for tie-breaks', () => {
    const attempts = [{ discs: [100, 100, 100] }, { discs: [5, 5, null] }, { discs: [50, 60, 70] }];
    expect(bestAttempt(attempts)).toEqual({ index: 2, total: 180 });
    expect(bestAttempt(emptyAttempts())).toBeNull();
  });

  it('records a disc immutably', () => {
    const before = emptyAttempts();
    const after = recordDisc(before, 1, 2, 999);
    expect(after[1].discs).toEqual([null, null, 300]);
    expect(before[1].discs).toEqual([null, null, null]);
  });

  it('normalizes stored data into 3 attempts × 3 discs', () => {
    expect(normalizeAttempts([{ discs: [1, 'x', 500, 7] }])).toEqual([
      { discs: [1, null, 300] },
      { discs: [null, null, null] },
      { discs: [null, null, null] },
    ]);
  });

  it('rejects blank player names', () => {
    expect(() => toPlayerDraft('   ', emptyAttempts())).toThrowError(/name/);
    expect(toPlayerDraft('  Ana   Marie ', emptyAttempts()).name).toBe('Ana Marie');
  });
});
