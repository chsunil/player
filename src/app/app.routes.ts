import { Routes } from '@angular/router';

export const appRoutes: Routes = [
  {
    path: '',
    redirectTo: '/tabs/home',
    pathMatch: 'full',
  },
  {
    path: 'tabs',
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
