import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { BrandMark } from '../../../shared/ui/brand-mark/brand-mark';
import { Icon } from '../../../shared/ui/icon/icon';
import { AuthStore } from '../application/auth.store';
import type { Credentials } from '../domain/admin-session';
import { LoginForm } from '../ui/login-form/login-form';

@Component({
  selector: 'app-login-page',
  imports: [RouterLink, BrandMark, Icon, LoginForm],
  templateUrl: './login-page.html',
  styleUrl: './login-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginPage {
  protected readonly auth = inject(AuthStore);
  private readonly router = inject(Router);

  protected async signIn(credentials: Credentials): Promise<void> {
    if (await this.auth.signIn(credentials)) {
      await this.router.navigate(['/admin']);
    }
  }
}
