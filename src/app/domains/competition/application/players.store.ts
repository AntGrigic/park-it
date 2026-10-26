import { computed, inject } from '@angular/core';
import {
  patchState,
  signalStore,
  withComputed,
  withHooks,
  withMethods,
  withProps,
  withState,
} from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { catchError, EMPTY, pipe, switchMap, tap } from 'rxjs';
import { ToastStore } from '../../../shared/data-access/toast.store';
import { DomainError } from '../../../shared/domain/domain-error';
import { describeError } from '../../../shared/util/describe-error';
import {
  createPlayerDraft,
  isNameTaken,
  toScoreSheet,
  type Player,
  type PlayerId,
  type ScoreSheet,
} from '../domain/player';
import { PlayerRepository } from '../domain/player.repository';
import { rankPlayers, summarize } from '../domain/ranking';

type LoadStatus = 'loading' | 'ready' | 'error';

interface PlayersState {
  readonly players: readonly Player[];
  readonly status: LoadStatus;
  readonly error: string | null;
  readonly savingIds: readonly PlayerId[];
}

const initialState: PlayersState = {
  players: [],
  status: 'loading',
  error: null,
  savingIds: [],
};

export const PlayersStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withProps(() => ({
    _repository: inject(PlayerRepository),
    _toasts: inject(ToastStore),
  })),
  withComputed(({ players }) => {
    const leaderboard = computed(() => rankPlayers(players()));
    return {
      leaderboard,
      podium: computed(() =>
        leaderboard()
          .filter((entry) => entry.rank !== null)
          .slice(0, 3),
      ),
      stats: computed(() => summarize(players(), leaderboard())),
      roster: computed(() =>
        [...players()].sort((first, second) => first.name.localeCompare(second.name)),
      ),
    };
  }),
  withMethods((store) => {
    const setSaving = (id: PlayerId, saving: boolean) =>
      patchState(store, ({ savingIds }) => ({
        savingIds: saving ? [...savingIds, id] : savingIds.filter((savingId) => savingId !== id),
      }));

    /** Runs a write, reporting the outcome as a toast. Resolves to whether it succeeded. */
    const write = async (id: PlayerId | null, work: () => Promise<string>): Promise<boolean> => {
      if (id) setSaving(id, true);
      try {
        store._toasts.success(await work());
        return true;
      } catch (error) {
        store._toasts.error(describeError(error));
        return false;
      } finally {
        if (id) setSaving(id, false);
      }
    };

    const assertUniqueName = (name: string, exceptId?: PlayerId) => {
      if (isNameTaken(store.players(), name, exceptId)) {
        throw new DomainError(`“${name}” is already on the board.`);
      }
    };

    return {
      _connect: rxMethod<void>(
        pipe(
          switchMap(() =>
            store._repository.watchAll().pipe(
              tap((players) => patchState(store, { players, status: 'ready', error: null })),
              catchError((error: unknown) => {
                patchState(store, { status: 'error', error: describeError(error) });
                return EMPTY;
              }),
            ),
          ),
        ),
      ),

      isSaving: (id: PlayerId) => store.savingIds().includes(id),

      addPlayer: (name: string) =>
        write(null, async () => {
          const draft = createPlayerDraft({ name });
          assertUniqueName(draft.name);
          await store._repository.add(draft);
          return `${draft.name} joined the board`;
        }),

      updatePlayer: (id: PlayerId, changes: ScoreSheet) =>
        write(id, async () => {
          const sheet = toScoreSheet(changes.name, changes.attempts);
          assertUniqueName(sheet.name, id);
          await store._repository.update(id, sheet);
          return `Saved ${sheet.name}`;
        }),

      removePlayer: (id: PlayerId) =>
        write(id, async () => {
          const name = store.players().find((player) => player.id === id)?.name ?? 'Player';
          await store._repository.remove(id);
          return `${name} was removed`;
        }),
    };
  }),
  withHooks({
    onInit: (store) => store._connect(),
  }),
);
