import { InjectionToken } from '@angular/core';
import { environment } from '../../../environments/environment';

export const isFirebaseConfigured = Boolean(
  environment.firebase.apiKey && environment.firebase.projectId,
);

/** True when no Firebase project is configured and data lives in this browser only. */
export const DEMO_MODE = new InjectionToken<boolean>('DEMO_MODE', {
  providedIn: 'root',
  factory: () => !isFirebaseConfigured,
});
