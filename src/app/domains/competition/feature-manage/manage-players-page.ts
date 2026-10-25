import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { Icon } from '../../../shared/ui/icon/icon';
import { PlayersStore } from '../application/players.store';
import { PARK_IT_RULES } from '../domain/park-it.rules';
import { AddPlayerForm } from '../ui/add-player-form/add-player-form';
import {
  type PlayerChanges,
  PlayerScoreEditor,
} from '../ui/player-score-editor/player-score-editor';

@Component({
  selector: 'app-manage-players-page',
  imports: [Icon, AddPlayerForm, PlayerScoreEditor],
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
      ? roster.filter((player) => player.name.toLocaleLowerCase().includes(query))
      : roster;
  });

  protected search(event: Event): void {
    this.query.set((event.target as HTMLInputElement).value);
  }

  protected add(name: string): void {
    void this.store.addPlayer(name);
  }

  protected save({ id, name, attempts }: PlayerChanges): void {
    void this.store.updatePlayer(id, { name, attempts });
  }

  protected remove(id: string): void {
    void this.store.removePlayer(id);
  }
}
