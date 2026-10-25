import type { Observable } from 'rxjs';
import type { Player, PlayerDraft, PlayerId } from './player';

/** Port for player persistence. Infrastructure provides the adapter (Firestore or demo storage). */
export abstract class PlayerRepository {
  /** Emits the full player list immediately and again on every change. */
  abstract watchAll(): Observable<readonly Player[]>;
  abstract add(draft: PlayerDraft): Promise<void>;
  abstract update(id: PlayerId, draft: PlayerDraft): Promise<void>;
  abstract remove(id: PlayerId): Promise<void>;
}
