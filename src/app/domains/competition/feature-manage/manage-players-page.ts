import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  signal,
  untracked,
} from '@angular/core';
import { Icon } from '../../../shared/ui/icon/icon';
import { PlayersStore } from '../application/players.store';
import { PARK_IT_RULES } from '../domain/park-it.rules';
import { findMissingPlayers } from '../domain/player';
import { AddPlayerForm } from '../ui/add-player-form/add-player-form';
import {
  type PlayerChanges,
  PlayerScoreEditor,
} from '../ui/player-score-editor/player-score-editor';
import { RosterImportCard } from '../ui/roster-import-card/roster-import-card';
import { EVENT_PLAYERS, eventRoster, SAMPLE_THROWS_PLAYER_COUNT } from './event-roster';

@Component({
  selector: 'app-manage-players-page',
  imports: [Icon, AddPlayerForm, PlayerScoreEditor, RosterImportCard],
  templateUrl: './manage-players-page.html',
  styleUrl: './manage-players-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ManagePlayersPage {
  protected readonly store = inject(PlayersStore);
  protected readonly rules = PARK_IT_RULES;
  protected readonly query = signal('');

  protected readonly takenNames = computed(
    () => new Set(this.store.players().map((player) => player.name.toLocaleLowerCase())),
  );

  protected readonly ranks = computed(
    () => new Map(this.store.leaderboard().map((entry) => [entry.playerId, entry.rank])),
  );

  protected readonly visiblePlayers = computed(() => {
    const query = this.query().trim().toLocaleLowerCase();
    const roster = this.store.roster();
    return query
      ? roster.filter(
          (player) =>
            player.name.toLocaleLowerCase().includes(query) || player.pdgaNumber?.includes(query),
        )
      : roster;
  });

  protected readonly eventRosterSize = EVENT_PLAYERS.length;
  protected readonly sampleThrowsCount = SAMPLE_THROWS_PLAYER_COUNT;
  private readonly registeredPlayers = eventRoster(false);
  protected readonly missingFromRoster = computed(
    () => findMissingPlayers(this.store.players(), this.registeredPlayers).length,
  );
  private readonly boardIsEmpty = computed(
    () => this.store.status() === 'ready' && this.store.players().length === 0,
  );
  private seedRequested = false;

  constructor() {
    // A brand-new board starts from the event roster, sample throws included, so the first
    // admin visit fills it without any clicks. Later gaps are filled from the import card.
    effect(() => {
      if (this.boardIsEmpty() && !this.seedRequested) {
        this.seedRequested = true;
        untracked(() => this.importRoster(true));
      }
    });
  }

  protected search(event: Event): void {
    this.query.set((event.target as HTMLInputElement).value);
  }

  protected add(name: string): void {
    void this.store.addPlayer(name);
  }

  protected importRoster(includeSampleThrows: boolean): void {
    void this.store.importPlayers(eventRoster(includeSampleThrows));
  }

  protected save({ id, name, attempts }: PlayerChanges): void {
    void this.store.updatePlayer(id, { name, attempts });
  }

  protected remove(id: string): void {
    void this.store.removePlayer(id);
  }
}
