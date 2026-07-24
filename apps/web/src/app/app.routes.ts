import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login.page').then(m => m.LoginPageComponent),
  },
  {
    path: 'register',
    loadComponent: () => import('./pages/register/register.page').then(m => m.RegisterPageComponent),
  },
  {
    path: 'app',
    loadComponent: () => import('./pages/dashboard/dashboard.page').then(m => m.DashboardPageComponent),
    canActivate: [authGuard],
  },
  {
    path: 'app/workspace/:id',
    loadComponent: () => import('./layouts/workspace-layout/workspace-layout.page').then(m => m.WorkspaceLayoutComponent),
    canActivate: [authGuard],
  },
  {
    path: 'app/workspace/:id/request/:reqId',
    loadComponent: () => import('./layouts/workspace-layout/workspace-layout.page').then(m => m.WorkspaceLayoutComponent),
    canActivate: [authGuard],
  },
  {
    path: 'shared/:token',
    loadComponent: () => import('./pages/shared-collection/shared-collection.page').then(m => m.SharedCollectionPageComponent),
  },
  {
    path: '',
    redirectTo: '/app',
    pathMatch: 'full',
  },
  {
    path: '**',
    redirectTo: '/app',
  },
];
