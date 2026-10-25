import { inject, Injectable } from '@angular/core';
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  serverTimestamp,
  updateDoc,
} from 'firebase/firestore';
import { Observable } from 'rxjs';
import { FIRESTORE } from '../../../core/firebase/firebase';
import type { Player, PlayerDraft, PlayerId } from '../domain/player';
import { PlayerRepository } from '../domain/player.repository';
import { fromPlayerDocument, toPlayerDocument } from './player.document';

@Injectable()
export class FirestorePlayerRepository extends PlayerRepository {
  private readonly players = collection(inject(FIRESTORE), 'players');

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
    await addDoc(this.players, {
      ...toPlayerDocument(draft),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  }

  async update(id: PlayerId, draft: PlayerDraft): Promise<void> {
    await updateDoc(doc(this.players, id), {
      ...toPlayerDocument(draft),
      updatedAt: serverTimestamp(),
    });
  }

  async remove(id: PlayerId): Promise<void> {
    await deleteDoc(doc(this.players, id));
  }
}
