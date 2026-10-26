import { ChangeDetectionStrategy, Component, inject, input, output } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import type { Credentials } from '../../domain/admin-session';

@Component({
  selector: 'app-login-form',
  imports: [ReactiveFormsModule],
  templateUrl: './login-form.html',
  styleUrl: './login-form.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginForm {
  readonly pending = input(false);
  readonly error = input<string | null>(null);
  readonly demoCredentials = input<Credentials | null>(null);
  readonly submitted = output<Credentials>();
  readonly googleSignIn = output<void>();
  readonly edited = output<void>();

  protected readonly form = inject(NonNullableFormBuilder).group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
  });

  protected submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const { email, password } = this.form.getRawValue();
    this.submitted.emit({ email: email.trim(), password });
  }

  protected useDemo(credentials: Credentials): void {
    this.form.setValue({ email: credentials.email, password: credentials.password });
    this.edited.emit();
  }
}
