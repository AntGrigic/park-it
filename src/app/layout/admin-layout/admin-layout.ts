import { ChangeDetectionStrategy, Component, effect, inject } from '@angular/core';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { AuthStore } from '../../domains/identity/application/auth.store';
import { BrandMark } from '../../shared/ui/brand-mark/brand-mark';
import { Icon } from '../../shared/ui/icon/icon';

/** Shell for the admin area: composes the identity context (session) around competition pages. */
@Component({
  selector: 'app-admin-layout',
  imports: [RouterOutlet, RouterLink, BrandMark, Icon],
  templateUrl: './admin-layout.html',
  styleUrl: './admin-layout.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminLayout {
  protected readonly auth = inject(AuthStore);
  private readonly router = inject(Router);

  constructor() {
    // Session ended elsewhere (another tab, token revoked): leave the admin area.
    effect(() => {
      if (this.auth.status() === 'signed-out') {
        void this.router.navigate(['/admin/login']);
      }
    });
  }

  protected async signOut(): Promise<void> {
    await this.router.navigate(['/']);
    await this.auth.signOut();
  }
}
