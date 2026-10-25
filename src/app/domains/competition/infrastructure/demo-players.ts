import type { DiscPoints, Player } from '../domain/player';

const attempts = (...rounds: DiscPoints[][]) => rounds.map((discs) => ({ discs }));

/** Sample board shown in demo mode, before a Firebase project is connected. */
export const DEMO_PLAYERS: readonly Player[] = [
  {
    id: 'demo-1',
    name: 'Maja Kovač',
    attempts: attempts([42, 18, 65], [12, 30, 22], [88, 300, 41]),
  },
  {
    id: 'demo-2',
    name: 'Luka Horvat',
    attempts: attempts([55, 23, 38], [19, 47, 31], [60, 12, 300]),
  },
  {
    id: 'demo-3',
    name: 'Ana Babić',
    attempts: attempts([70, 64, 15], [33, 28, 52], [null, null, null]),
  },
  {
    id: 'demo-4',
    name: 'Ivan Novak',
    attempts: attempts([120, 300, 85], [96, 44, 140], [77, 61, 102]),
  },
  {
    id: 'demo-5',
    name: 'Petra Jurić',
    attempts: attempts([150, 300, 210], [300, 128, 96], [24, 60, null]),
  },
  {
    id: 'demo-6',
    name: 'Marko Perić',
    attempts: attempts([8, null, null], [null, null, null], [null, null, null]),
  },
];
