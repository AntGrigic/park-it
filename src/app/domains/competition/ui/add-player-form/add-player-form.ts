import { ChangeDetectionStrategy, Component, inject, input, output } from '@angular/core';
import {
  type AbstractControl,
  NonNullableFormBuilder,
  ReactiveFormsModule,
  type ValidationErrors,
  Validators,
} from '@angular/forms';
import { Icon } from '../../../../shared/ui/icon/icon';
import { normalizePlayerName, PLAYER_NAME_MAX_LENGTH } from '../../domain/player';

@Component({
  selector: 'app-add-player-form',
  imports: [ReactiveFormsModule, Icon],
  templateUrl: './add-player-form.html',
  styleUrl: './add-player-form.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddPlayerForm {
  /** Lower-cased names already on the board. */
  readonly takenNames = input<ReadonlySet<string>>(new Set());
  readonly add = output<string>();

  protected readonly maxLength = PLAYER_NAME_MAX_LENGTH;
  protected readonly form = inject(NonNullableFormBuilder).group({
    name: [
      '',
      [
        Validators.required,
        Validators.maxLength(PLAYER_NAME_MAX_LENGTH),
        (control: AbstractControl) => this.uniqueName(control),
      ],
    ],
  });

  protected submit(): void {
    const name = normalizePlayerName(this.form.controls.name.value);
    this.form.controls.name.setValue(name);
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.add.emit(name);
    this.form.reset();
  }

  private uniqueName(control: AbstractControl): ValidationErrors | null {
    const key = normalizePlayerName(String(control.value ?? '')).toLocaleLowerCase();
    return key && this.takenNames().has(key) ? { taken: true } : null;
  }
}
