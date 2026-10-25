import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import type { PARK_IT_RULES } from '../../domain/park-it.rules';
import { Icon } from '../../../../shared/ui/icon/icon';

@Component({
  selector: 'app-rules-card',
  imports: [Icon],
  templateUrl: './rules-card.html',
  styleUrl: './rules-card.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RulesCard {
  readonly rules = input.required<typeof PARK_IT_RULES>();
}
