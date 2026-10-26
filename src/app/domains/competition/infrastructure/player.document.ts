import type { DocumentData } from 'firebase/firestore';
import {
  normalizeAttempts,
  normalizeDivision,
  normalizePdgaNumber,
  type Player,
  type PlayerDraft,
  type PlayerId,
  type ScoreSheet,
} from '../domain/player';

/**
 * Shape of a document in the `players` collection.
 * Firestore cannot store nested arrays, so each attempt is a map holding its discs.
 */
export interface PlayerDocument {
  name: string;
  attempts: { discs: (number | null)[] }[];
  division: string | null;
  pdgaNumber: string | null;
}

export type ScoreSheetDocument = Pick<PlayerDocument, 'name' | 'attempts'>;

export function toScoreSheetDocument(sheet: ScoreSheet): ScoreSheetDocument {
  return {
    name: sheet.name,
    attempts: sheet.attempts.map((attempt) => ({ discs: [...attempt.discs] })),
  };
}

export function toPlayerDocument(draft: PlayerDraft): PlayerDocument {
  return {
    ...toScoreSheetDocument(draft),
    division: draft.division,
    pdgaNumber: draft.pdgaNumber,
  };
}

export function fromPlayerDocument(id: PlayerId, data: DocumentData): Player {
  return {
    id,
    name: typeof data['name'] === 'string' ? data['name'] : 'Unnamed player',
    attempts: normalizeAttempts(Array.isArray(data['attempts']) ? data['attempts'] : []),
    division: normalizeDivision(data['division']),
    pdgaNumber: normalizePdgaNumber(data['pdgaNumber']),
  };
}
