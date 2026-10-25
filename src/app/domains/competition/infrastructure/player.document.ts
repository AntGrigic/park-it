import type { DocumentData } from 'firebase/firestore';
import { normalizeAttempts, type Player, type PlayerDraft, type PlayerId } from '../domain/player';

/**
 * Shape of a document in the `players` collection.
 * Firestore cannot store nested arrays, so each attempt is a map holding its discs.
 */
export interface PlayerDocument {
  name: string;
  attempts: { discs: (number | null)[] }[];
}

export function toPlayerDocument(draft: PlayerDraft): PlayerDocument {
  return {
    name: draft.name,
    attempts: draft.attempts.map((attempt) => ({ discs: [...attempt.discs] })),
  };
}

export function fromPlayerDocument(id: PlayerId, data: DocumentData): Player {
  return {
    id,
    name: typeof data['name'] === 'string' ? data['name'] : 'Unnamed player',
    attempts: normalizeAttempts(Array.isArray(data['attempts']) ? data['attempts'] : []),
  };
}
