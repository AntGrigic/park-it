import { ChangeDetectionStrategy, Component, input, output, signal } from '@angular/core';
import { Icon } from '../../../../shared/ui/icon/icon';

/** Offers to add the registered players who are not on the board yet. */
@Component({
  selector: 'app-roster-import-card',
  imports: [Icon],
  templateUrl: './roster-import-card.html',
  styleUrl: './roster-import-card.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RosterImportCard {
  readonly missingCount = input.required<number>();
  readonly rosterSize = input.required<number>();
  readonly sampleThrowsCount = input(0);
  readonly importing = input(false);
  /** Emits whether to include the sample throws. */
  readonly importRoster = output<boolean>();

  protected readonly includeSampleThrows = signal(true);

  protected toggleSampleThrows(event: Event): void {
    this.includeSampleThrows.set((event.target as HTMLInputElement).checked);
  }
}
