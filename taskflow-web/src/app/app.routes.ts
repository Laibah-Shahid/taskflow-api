import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth-guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'tasks',
    pathMatch: 'full'
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./features/login/login').then(m => m.LoginComponent)
  },
  {
    path: 'tasks',
    loadComponent: () =>
      import('./features/tasks/tasks').then(m => m.TasksComponent),
    canActivate: [authGuard]
  },
  {
    path: '**',
    redirectTo: 'tasks'
  }
];