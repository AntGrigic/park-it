import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import type { LeaderboardEntry } from '../../domain/ranking';

/** Top three players, shown 2 · 1 · 3 on wide screens. */
@Component({
  selector: 'app-podium',
  templateUrl: './podium.html',
  styleUrl: './podium.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Podium {
  readonly entries = input.required<readonly LeaderboardEntry[]>();
}
