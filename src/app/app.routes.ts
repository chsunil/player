import { Routes } from '@angular/router';
import { onboardingGuard } from './core/guards/onboarding.guard';

export const appRoutes: Routes = [
  {
    path: '',
    redirectTo: '/intro',
    pathMatch: 'full',
  },
  {
    path: 'intro',
    loadComponent: () => import('./features/intro/intro.component').then(m => m.IntroComponent),
  },
  {
    path: 'tabs',
    canActivate: [onboardingGuard],
    loadComponent: () => import('./features/tabs/tabs.component').then(m => m.TabsComponent),
    loadChildren: () => import('./features/tabs/tabs.routes').then(m => m.tabsRoutes),
  },
  {
    path: 'album/:id',
    loadComponent: () =>
      import('./features/library/album-detail/album-detail.component').then(
        m => m.AlbumDetailComponent,
      ),
  },
  {
    path: 'artist/:id',
    loadComponent: () =>
      import('./features/library/artist-detail/artist-detail.component').then(
        m => m.ArtistDetailComponent,
      ),
  },
  {
    path: 'playlist/:id',
    loadComponent: () =>
      import('./features/playlists/playlist-detail/playlist-detail.component').then(
        m => m.PlaylistDetailComponent,
      ),
  },
  {
    path: '**',
    redirectTo: '/tabs/home',
  },
];
