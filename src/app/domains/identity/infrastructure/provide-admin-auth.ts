import type { Provider } from '@angular/core';
import { isFirebaseConfigured } from '../../../core/config/data-mode';
import { AuthStore } from '../application/auth.store';
import { AuthGateway } from '../domain/auth.gateway';
import { DemoAuthGateway } from './demo-auth.gateway';
import { FirebaseAuthGateway } from './firebase-auth.gateway';

export function provideAdminAuth(): Provider[] {
  return [
    {
      provide: AuthGateway,
      useClass: isFirebaseConfigured ? FirebaseAuthGateway : DemoAuthGateway,
    },
    AuthStore,
  ];
}
