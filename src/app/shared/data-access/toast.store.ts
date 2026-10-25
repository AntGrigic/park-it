import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';

export type ToastKind = 'success' | 'error';

export interface Toast {
  readonly id: number;
  readonly kind: ToastKind;
  readonly message: string;
}

const MAX_VISIBLE = 4;

export const ToastStore = signalStore(
  { providedIn: 'root' },
  withState({ toasts: [] as readonly Toast[] }),
  withMethods((store) => {
    let nextId = 0;

    const dismiss = (id: number) =>
      patchState(store, ({ toasts }) => ({ toasts: toasts.filter((toast) => toast.id !== id) }));

    const show = (kind: ToastKind, message: string, durationMs: number) => {
      const id = ++nextId;
      patchState(store, ({ toasts }) => ({
        toasts: [...toasts, { id, kind, message }].slice(-MAX_VISIBLE),
      }));
      setTimeout(() => dismiss(id), durationMs);
    };

    return {
      success: (message: string) => show('success', message, 3000),
      error: (message: string) => show('error', message, 6000),
      dismiss,
    };
  }),
);
