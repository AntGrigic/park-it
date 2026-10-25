import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  inject,
  input,
  linkedSignal,
  output,
  signal,
} from '@angular/core';
import { Icon } from '../../../../shared/ui/icon/icon';
import { PARK_IT_RULES } from '../../domain/park-it.rules';
import {
  isValidPlayerName,
  PLAYER_NAME_MAX_LENGTH,
  recordDisc,
  sameDraft,
  type Player,
  type PlayerDraft,
  type PlayerId,
} from '../../domain/player';
import { attemptTotal, playerTotal, runningTotal, toDiscPoints } from '../../domain/scoring';

export interface PlayerChanges extends PlayerDraft {
  readonly id: PlayerId;
}

const DELETE_CONFIRM_WINDOW_MS = 4000;

/** Edits one player's name and disc scores. Keeps a local draft until saved. */
@Component({
  selector: 'app-player-score-editor',
  imports: [Icon],
  templateUrl: './player-score-editor.html',
  styleUrl: './player-score-editor.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlayerScoreEditor {
  readonly player = input.required<Player>();
  readonly rank = input<number | null>(null);
  readonly saving = input(false);
  readonly save = output<PlayerChanges>();
  readonly remove = output<PlayerId>();

  protected readonly rules = PARK_IT_RULES;
  protected readonly maxNameLength = PLAYER_NAME_MAX_LENGTH;

  /** Compared by value so live updates to other players don't wipe this draft. */
  private readonly saved = computed<PlayerDraft>(
    () => ({ name: this.player().name, attempts: this.player().attempts }),
    { equal: sameDraft },
  );
  protected readonly draft = linkedSignal(() => this.saved());

  protected readonly totals = computed(() => this.draft().attempts.map(attemptTotal));
  protected readonly total = computed(() => playerTotal(this.draft().attempts));
  protected readonly running = computed(() => runningTotal(this.draft().attempts));
  protected readonly nameValid = computed(() => isValidPlayerName(this.draft().name));
  protected readonly dirty = computed(() => !sameDraft(this.draft(), this.saved()));
  protected readonly confirmingDelete = signal(false);

  private confirmTimer?: ReturnType<typeof setTimeout>;

  constructor() {
    inject(DestroyRef).onDestroy(() => clearTimeout(this.confirmTimer));
  }

  protected setName(event: Event): void {
    const name = (event.target as HTMLInputElement).value;
    this.draft.update((draft) => ({ ...draft, name }));
  }

  protected setDisc(attemptIndex: number, discIndex: number, event: Event): void {
    const input = event.target as HTMLInputElement;
    const points = toDiscPoints(input.value);
    // Reflect clamping (e.g. 450 → 300) straight away so the field matches the score.
    if (points !== null && Number(input.value) !== points) {
      input.value = String(points);
    }
    this.draft.update((draft) => ({
      ...draft,
      attempts: recordDisc(draft.attempts, attemptIndex, discIndex, points),
    }));
  }

  protected submit(event: Event): void {
    event.preventDefault();
    if (!this.dirty() || !this.nameValid() || this.saving()) {
      return;
    }
    this.save.emit({ id: this.player().id, ...this.draft() });
  }

  protected reset(): void {
    this.draft.set(this.saved());
  }

  protected requestDelete(): void {
    if (this.confirmingDelete()) {
      clearTimeout(this.confirmTimer);
      this.confirmingDelete.set(false);
      this.remove.emit(this.player().id);
      return;
    }
    this.confirmingDelete.set(true);
    this.confirmTimer = setTimeout(
      () => this.confirmingDelete.set(false),
      DELETE_CONFIRM_WINDOW_MS,
    );
  }
}
