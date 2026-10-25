import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DEMO_MODE } from '../../../core/config/data-mode';
import { BrandMark } from '../../../shared/ui/brand-mark/brand-mark';
import { Icon } from '../../../shared/ui/icon/icon';
import { PlayersStore } from '../application/players.store';
import { PARK_IT_RULES } from '../domain/park-it.rules';
import { LeaderboardTable } from '../ui/leaderboard-table/leaderboard-table';
import { Podium } from '../ui/podium/podium';
import { RulesCard } from '../ui/rules-card/rules-card';
import { StatsStrip } from '../ui/stats-strip/stats-strip';

@Component({
  selector: 'app-leaderboard-page',
  imports: [RouterLink, BrandMark, Icon, StatsStrip, Podium, LeaderboardTable, RulesCard],
  templateUrl: './leaderboard-page.html',
  styleUrl: './leaderboard-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LeaderboardPage {
  protected readonly store = inject(PlayersStore);
  protected readonly demoMode = inject(DEMO_MODE);
  protected readonly rules = PARK_IT_RULES;
}
