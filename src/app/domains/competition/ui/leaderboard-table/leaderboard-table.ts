import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import type { DiscPoints } from '../../domain/player';
import type { LeaderboardEntry } from '../../domain/ranking';

@Component({
  selector: 'app-leaderboard-table',
  templateUrl: './leaderboard-table.html',
  styleUrl: './leaderboard-table.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LeaderboardTable {
  readonly entries = input.required<readonly LeaderboardEntry[]>();
  readonly attemptsPerPlayer = input.required<number>();
  readonly discsPerAttempt = input.required<number>();

  protected readonly attemptNumbers = computed(() =>
    Array.from({ length: this.attemptsPerPlayer() }, (_slot, index) => index + 1),
  );
  protected readonly totalDiscs = computed(() => this.attemptsPerPlayer() * this.discsPerAttempt());

  protected formatDiscs(discs: readonly DiscPoints[]): string {
    return discs.map((disc) => disc ?? '–').join(' · ');
  }
}
