import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import type { LeaderboardStats } from '../../domain/ranking';

@Component({
  selector: 'app-stats-strip',
  templateUrl: './stats-strip.html',
  styleUrl: './stats-strip.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StatsStrip {
  readonly stats = input.required<LeaderboardStats>();
}
