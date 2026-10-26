import { createPlayerDraft, findMissingPlayers, type Player, type PlayerDraft } from './player';

function onBoard(draft: PlayerDraft, id: string): Player {
  return { id, ...draft };
}

describe('createPlayerDraft', () => {
  it('normalizes the name, division and PDGA number', () => {
    const draft = createPlayerDraft({
      name: '  Ari   Penttala ',
      division: ' mpo ',
      pdgaNumber: '8366',
    });
    expect(draft).toMatchObject({ name: 'Ari Penttala', division: 'MPO', pdgaNumber: '8366' });
    expect(draft.attempts).toHaveLength(3);
  });

  it('drops a division or PDGA number that is not valid', () => {
    const draft = createPlayerDraft({ name: 'Ana', division: '', pdgaNumber: 'abc' });
    expect(draft).toMatchObject({ division: null, pdgaNumber: null });
  });

  it('keeps given throws and fills the rest as not thrown', () => {
    const draft = createPlayerDraft({ name: 'Ana', attempts: [{ discs: [10, 20, 30] }] });
    expect(draft.attempts).toEqual([
      { discs: [10, 20, 30] },
      { discs: [null, null, null] },
      { discs: [null, null, null] },
    ]);
  });
});

describe('findMissingPlayers', () => {
  const ari = createPlayerDraft({ name: 'Ari Penttala', pdgaNumber: '8366' });
  const danica = createPlayerDraft({ name: 'Danica Pajtak', pdgaNumber: '62432' });
  const guest = createPlayerDraft({ name: 'Guest Player' });

  it('matches by PDGA number even if the name was edited on the board', () => {
    const board = [onBoard({ ...ari, name: 'Ari P.' }, 'one')];
    expect(findMissingPlayers(board, [ari, danica])).toEqual([danica]);
  });

  it('matches by name when there is no PDGA number', () => {
    const board = [onBoard(createPlayerDraft({ name: 'guest player' }), 'one')];
    expect(findMissingPlayers(board, [guest, ari])).toEqual([ari]);
  });

  it('returns nothing once everyone is on the board', () => {
    const board = [onBoard(ari, 'one'), onBoard(danica, 'two')];
    expect(findMissingPlayers(board, [ari, danica])).toEqual([]);
  });
});
