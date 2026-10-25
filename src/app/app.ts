import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Toaster } from './shared/ui/toaster/toaster';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Toaster],
  template: `
    <router-outlet />
    <app-toaster />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {}
