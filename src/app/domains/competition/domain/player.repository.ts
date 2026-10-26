import type { Observable } from 'rxjs';
import type { Player, PlayerDraft, PlayerId, ScoreSheet } from './player';

/** Port for player persistence. Infrastructure provides the adapter (Firestore or demo storage). */
export abstract class PlayerRepository {
  /** Emits the full player list immediately and again on every change. */
  abstract watchAll(): Observable<readonly Player[]>;
  abstract add(draft: PlayerDraft): Promise<void>;
  /** Adds several players in one go — all of them or none. */
  abstract addMany(drafts: readonly PlayerDraft[]): Promise<void>;
  /** Saves name and attempts; division and PDGA number stay as they are. */
  abstract update(id: PlayerId, sheet: ScoreSheet): Promise<void>;
  abstract remove(id: PlayerId): Promise<void>;
}
