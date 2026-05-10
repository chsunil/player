import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
  provideZoneChangeDetection,
} from '@angular/core';
import {
  provideRouter,
  withComponentInputBinding,
  withPreloading,
  PreloadAllModules,
  withViewTransitions,
} from '@angular/router';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideIonicAngular } from '@ionic/angular/standalone';
import { appRoutes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),

    provideRouter(
      appRoutes,
      withPreloading(PreloadAllModules),
      withComponentInputBinding(),
      withViewTransitions(),
    ),

    provideHttpClient(
      withFetch(),
      withInterceptors([]),
    ),

    provideAnimationsAsync(),

    provideIonicAngular({
      mode:           'md',
      animated:       true,
      rippleEffect:   true,
      backButtonText: '',
    }),
  ],
};
