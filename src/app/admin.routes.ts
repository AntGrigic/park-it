import type { Routes } from '@angular/router';
import { adminGuard, guestGuard } from './domains/identity/application/auth.guards';
import { provideAdminAuth } from './domains/identity/infrastructure/provide-admin-auth';

/** Lazily loaded, so Firebase Auth and the admin screens never ship to leaderboard viewers. */
export const adminRoutes: Routes = [
  {
    path: '',
    providers: [provideAdminAuth()],
    children: [
      {
        path: 'login',
        title: 'Admin sign in · Park it!',
        canActivate: [guestGuard],
        loadComponent: () =>
          import('./domains/identity/feature-login/login-page').then((module) => module.LoginPage),
      },
      {
        path: '',
        canActivate: [adminGuard],
        loadComponent: () =>
          import('./layout/admin-layout/admin-layout').then((module) => module.AdminLayout),
        children: [
          {
            path: '',
            title: 'Manage players · Park it!',
            loadComponent: () =>
              import('./domains/competition/feature-manage/manage-players-page').then(
                (module) => module.ManagePlayersPage,
              ),
          },
        ],
      },
    ],
  },
];
