import { Injectable } from '@angular/core';
import { BehaviorSubject, delay, Observable } from 'rxjs';
import type { Player, PlayerDraft, PlayerId } from '../domain/player';
import { PlayerRepository } from '../domain/player.repository';
import { fromPlayerDocument, toPlayerDocument } from './player.document';
import { DEMO_PLAYERS } from './demo-players';

const STORAGE_KEY = 'park-it.demo-players';

/** Demo-mode adapter: keeps players in this browser's local storage. */
@Injectable()
export class LocalPlayerRepository extends PlayerRepository {
  private readonly players$ = new BehaviorSubject<readonly Player[]>(this.restore());

  watchAll(): Observable<readonly Player[]> {
    // A short delay mimics the first network round-trip so loading states are visible.
    return this.players$.pipe(delay(250));
  }

  async add(draft: PlayerDraft): Promise<void> {
    this.commit([...this.players$.value, { id: crypto.randomUUID(), ...draft }]);
  }

  async update(id: PlayerId, draft: PlayerDraft): Promise<void> {
    this.commit(
      this.players$.value.map((player) => (player.id === id ? { id, ...draft } : player)),
    );
  }

  async remove(id: PlayerId): Promise<void> {
    this.commit(this.players$.value.filter((player) => player.id !== id));
  }

  private commit(players: readonly Player[]): void {
    this.players$.next(players);
    try {
      const documents = players.map((player) => ({ id: player.id, ...toPlayerDocument(player) }));
      localStorage.setItem(STORAGE_KEY, JSON.stringify(documents));
    } catch {
      // Storage can be unavailable (private mode, quota); the in-memory board still works.
    }
  }

  private restore(): readonly Player[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const documents = JSON.parse(raw) as { id: string }[];
        return documents.map((storedPlayer) => fromPlayerDocument(storedPlayer.id, storedPlayer));
      }
    } catch {
      // Fall through to the sample board.
    }
    return DEMO_PLAYERS;
  }
}
