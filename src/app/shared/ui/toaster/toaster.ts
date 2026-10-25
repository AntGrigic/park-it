import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ToastStore } from '../../data-access/toast.store';
import { Icon } from '../icon/icon';

@Component({
  selector: 'app-toaster',
  imports: [Icon],
  templateUrl: './toaster.html',
  styleUrl: './toaster.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Toaster {
  protected readonly store = inject(ToastStore);
}
