import { Route } from '@angular/router';
import { authGuard } from './auth/guards/auth.guard';

export const appRoutes: Route[] = [
  {
    path: 'login',
    loadComponent: () =>
      import('./auth/components/login/login.component').then(
        (m) => m.LoginComponent
      ),
  },
  {
    path: 'register',
    loadComponent: () =>
      import('./auth/components/register/register.component').then(
        (m) => m.RegisterComponent
      ),
  },
  {
    path: 'dashboard',
    loadComponent: () =>
      import('./dashboard/components/main-page/main-page.component').then(
        (m) => m.MainPageComponent
      ),
    canActivate: [authGuard],
  },
  {
    path: 'under-development',
    loadComponent: () =>
      import(
        './shared/components/under-development/under-development.component'
      ).then((m) => m.UnderDevelopmentComponent),
  },
  {
    path: 'create-with-json',
    loadComponent: () =>
      import('./create-with-json/create-with-json.component').then(
        (m) => m.CreateWithJsonComponent
      ),
  },
  {
    path: 'edit-profile',
    loadComponent: () =>
      import('./edit-profile/edit-profile.component').then(
        (m) => m.EditProfileComponent
      ),
  },
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'login',
  },
  {
    path: '**',
    redirectTo: 'under-development',
  },
];
