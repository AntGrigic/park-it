import { ChangeDetectionStrategy, Component } from '@angular/core';

let nextId = 0;

/** Park it! logo: the 1 m / 2 m / 3 m circles around the pin, with a parked disc. */
@Component({
  selector: 'app-brand-mark',
  host: { 'aria-hidden': 'true' },
  styles: `
    :host {
      display: inline-block;
      width: 40px;
      height: 40px;
      flex: none;
    }
    svg {
      display: block;
      width: 100%;
      height: 100%;
    }
  `,
  template: `
    <svg viewBox="0 0 48 48">
      <defs>
        <linearGradient [attr.id]="gradientId" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" style="stop-color: var(--violet)" />
          <stop offset="0.55" style="stop-color: var(--pink)" />
          <stop offset="1" style="stop-color: var(--amber)" />
        </linearGradient>
      </defs>
      <g fill="none" [attr.stroke]="gradientUrl" stroke-width="2.5">
        <circle cx="24" cy="24" r="21" opacity="0.3" />
        <circle cx="24" cy="24" r="14" opacity="0.6" />
        <circle cx="24" cy="24" r="7" />
      </g>
      <circle cx="24" cy="24" r="2.5" fill="currentColor" />
      <circle cx="32" cy="16.5" r="4.5" [attr.fill]="gradientUrl" />
    </svg>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BrandMark {
  protected readonly gradientId = `park-it-gradient-${nextId++}`;
  protected readonly gradientUrl = `url(#${this.gradientId})`;
}
