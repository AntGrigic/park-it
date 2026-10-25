import type { Provider } from '@angular/core';
import { isFirebaseConfigured } from '../../../core/config/data-mode';
import { PlayerRepository } from '../domain/player.repository';
import { FirestorePlayerRepository } from './firestore-player.repository';
import { LocalPlayerRepository } from './local-player.repository';

export function providePlayerRepository(): Provider {
  return {
    provide: PlayerRepository,
    useClass: isFirebaseConfigured ? FirestorePlayerRepository : LocalPlayerRepository,
  };
}
