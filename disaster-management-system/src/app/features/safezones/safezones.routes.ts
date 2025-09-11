import { Routes } from '@angular/router';
import { SafezonesListComponent } from './safezones-list/safezones-list.component';
import { AuthGuard } from '../../core/guards/auth.guard';

export const SAFEZONES_ROUTES: Routes = [
  {
    path: '',
    component: SafezonesListComponent,
    canActivate: [AuthGuard]
  }
];
