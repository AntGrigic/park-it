import { inject, Injectable } from '@angular/core';
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  serverTimestamp,
  updateDoc,
  writeBatch,
} from 'firebase/firestore';
import { Observable } from 'rxjs';
import { FIRESTORE } from '../../../core/firebase/firebase';
import type { Player, PlayerDraft, PlayerId, ScoreSheet } from '../domain/player';
import { PlayerRepository } from '../domain/player.repository';
import { fromPlayerDocument, toPlayerDocument, toScoreSheetDocument } from './player.document';

@Injectable()
export class FirestorePlayerRepository extends PlayerRepository {
  private readonly firestore = inject(FIRESTORE);
  private readonly players = collection(this.firestore, 'players');

  watchAll(): Observable<readonly Player[]> {
    return new Observable<readonly Player[]>((subscriber) =>
      onSnapshot(
        this.players,
        (snapshot) =>
          subscriber.next(
            snapshot.docs.map((playerSnapshot) =>
              fromPlayerDocument(playerSnapshot.id, playerSnapshot.data()),
            ),
          ),
        (error) => subscriber.error(error),
      ),
    );
  }

  async add(draft: PlayerDraft): Promise<void> {
    await addDoc(this.players, this.newDocument(draft));
  }

  async addMany(drafts: readonly PlayerDraft[]): Promise<void> {
    // A single batch is atomic and allows up to 500 writes — far more than an event roster.
    const batch = writeBatch(this.firestore);
    for (const draft of drafts) {
      batch.set(doc(this.players), this.newDocument(draft));
    }
    await batch.commit();
  }

  async update(id: PlayerId, sheet: ScoreSheet): Promise<void> {
    await updateDoc(doc(this.players, id), {
      ...toScoreSheetDocument(sheet),
      updatedAt: serverTimestamp(),
    });
  }

  async remove(id: PlayerId): Promise<void> {
    await deleteDoc(doc(this.players, id));
  }

  private newDocument(draft: PlayerDraft) {
    return {
      ...toPlayerDocument(draft),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };
  }
}
