import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  {
    path: 'home',
    title: 'PD Gallery — Public Domain Art',
    loadComponent: () => import('./features/home/home.component').then((m) => m.HomeComponent),
  },
  {
    path: 'browse',
    title: 'Browse Artworks — PD Gallery',
    loadComponent: () => import('./features/browse/browse.component').then((m) => m.BrowseComponent),
  },
  {
    path: 'artwork/:id',
    title: 'Artwork Details — PD Gallery',
    loadComponent: () => import('./features/artwork/artwork.component').then((m) => m.ArtworkComponent),
  },
  {
    path: 'collection',
    title: 'My Collection — PD Gallery',
    loadComponent: () => import('./features/collection/collection.component').then((m) => m.CollectionComponent),
  },
  {
    path: 'artist/:id',
    title: 'Artist — PD Gallery',
    loadComponent: () => import('./features/artist/artist.component').then((m) => m.ArtistComponent),
  },
  {
    path: 'department/:name',
    title: 'Department — PD Gallery',
    loadComponent: () => import('./features/department/department.component').then((m) => m.DepartmentComponent),
  },
  {
    path: 'exhibitions',
    title: 'Exhibitions — PD Gallery',
    loadComponent: () => import('./features/exhibition/exhibition.component').then((m) => m.ExhibitionComponent),
  },
  {
    path: 'about',
    title: 'About — PD Gallery',
    loadComponent: () => import('./features/about/about.component').then((m) => m.AboutComponent),
  },
  {
    path: '**',
    title: 'Page Not Found — PD Gallery',
    loadComponent: () => import('./features/not-found/not-found.component').then((m) => m.NotFoundComponent),
  },
];
