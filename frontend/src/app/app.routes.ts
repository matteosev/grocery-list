import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./grocery/lists-page/lists-page.component').then(m => m.ListsPageComponent)
  },
  {
    path: 'list/:id',
    loadComponent: () => import('./grocery/detail-page/detail-page.component').then(m => m.DetailPageComponent)
  },
  {
    path: '**',
    redirectTo: ''
  }
];
