import type { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    title: 'Park it! · Leaderboard',
    loadComponent: () =>
      import('./domains/competition/feature-leaderboard/leaderboard-page').then(
        (module) => module.LeaderboardPage,
      ),
  },
  {
    path: 'admin',
    loadChildren: () => import('./admin.routes').then((module) => module.adminRoutes),
  },
  { path: '**', redirectTo: '' },
];
