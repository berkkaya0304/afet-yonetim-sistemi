import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadChildren: () => import('./features/home/home.routes').then(m => m.HOME_ROUTES)
  },
  {
    path: 'auth',
    loadChildren: () => import('./features/auth/auth.routes').then(m => m.AUTH_ROUTES)
  },
  {
    path: 'dashboard',
    redirectTo: '/',
    pathMatch: 'full'
  },
  {
    path: 'help-requests',
    loadChildren: () => import('./features/help-requests/help-requests.routes').then(m => m.HELP_REQUESTS_ROUTES)
  },
  {
    path: 'assignments',
    loadChildren: () => import('./features/assignments/assignments.routes').then(m => m.ASSIGNMENTS_ROUTES)
  },
  {
    path: 'safezones',
    loadChildren: () => import('./features/safezones/safezones.routes').then(m => m.SAFEZONES_ROUTES)
  },
  {
    path: 'admin',
    loadChildren: () => import('./features/admin/admin.routes').then(m => m.ADMIN_ROUTES)
  },
  {
    path: 'volunteer',
    loadChildren: () => import('./features/volunteer/volunteer.routes').then(m => m.VOLUNTEER_ROUTES)
  },
  {
    path: 'user',
    loadChildren: () => import('./features/user/user.routes').then(m => m.USER_ROUTES)
  },
  {
    path: 'profile',
    loadChildren: () => import('./features/profile/profile.routes').then(m => m.PROFILE_ROUTES)
  },
  {
    path: 'notifications',
    loadChildren: () => import('./features/notifications/notifications.routes').then(m => m.NOTIFICATIONS_ROUTES)
  },
  {
    path: '**',
    redirectTo: ''
  }
];
