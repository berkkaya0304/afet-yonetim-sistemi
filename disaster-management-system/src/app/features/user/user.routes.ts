import { Routes } from '@angular/router';
import { UserComponent } from './user.component';
import { CitizenGuard } from '../../core/guards/citizen.guard';

export const USER_ROUTES: Routes = [
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full'
  },
  {
    path: 'dashboard',
    component: UserComponent,
    canActivate: [CitizenGuard]
  }
];
