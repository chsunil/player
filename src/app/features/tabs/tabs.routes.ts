import { Routes } from '@angular/router';

export const tabsRoutes: Routes = [
  {
    path: 'home',
    loadComponent: () => import('../home/home.component').then(m => m.HomeComponent),
  },
  {
    path: 'library',
    loadComponent: () => import('../library/library.component').then(m => m.LibraryComponent),
  },
  {
    path: 'search',
    loadComponent: () => import('../search/search.component').then(m => m.SearchComponent),
  },
  {
    path: 'nextcloud',
    loadComponent: () => import('../nextcloud/nextcloud.component').then(m => m.NextcloudComponent),
  },
  {
    path: 'settings',
    loadComponent: () => import('../settings/settings.component').then(m => m.SettingsComponent),
  },
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full',
  },
];
