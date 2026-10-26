import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { Icon } from '../../../../shared/ui/icon/icon';
import { pdgaProfileUrl } from '../../domain/player';

/** A player's PDGA number, linking to their profile on pdga.com in a new tab. */
@Component({
  selector: 'app-pdga-link',
  imports: [Icon],
  template: `
    <a
      class="pdga-link tnum"
      [href]="profileUrl()"
      target="_blank"
      rel="noopener noreferrer"
      [title]="'Open PDGA profile #' + pdgaNumber()"
      [attr.aria-label]="label()"
    >
      #{{ pdgaNumber() }}
      <app-icon name="external" />
    </a>
  `,
  styles: `
    .pdga-link {
      display: inline-flex;
      align-items: center;
      gap: 3px;
      font-size: 12px;
      font-weight: 500;
      color: var(--text-3);
      text-decoration: none;
      white-space: nowrap;
      transition: color 0.15s var(--ease);

      &:hover,
      &:focus-visible {
        color: var(--violet);
        text-decoration: underline;
      }
    }

    app-icon {
      width: 11px;
      height: 11px;
      opacity: 0.7;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PdgaLink {
  readonly pdgaNumber = input.required<string>();
  readonly playerName = input<string | null>(null);

  protected readonly profileUrl = computed(() => pdgaProfileUrl(this.pdgaNumber()));
  protected readonly label = computed(() => {
    const owner = this.playerName() ? ` of ${this.playerName()}` : '';
    return `PDGA profile${owner}, number ${this.pdgaNumber()} (opens in a new tab)`;
  });
}
