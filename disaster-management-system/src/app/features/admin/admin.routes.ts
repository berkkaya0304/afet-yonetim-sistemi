import { Routes } from '@angular/router';
import { YonetimPaneliComponent } from './admin-dashboard/yonetim-paneli.component';
import { AdminRequestsComponent } from './admin-requests/admin-requests.component';
import { AdminVolunteersComponent } from './admin-volunteers/admin-volunteers.component';
import { AdminBadgesComponent } from './admin-badges/admin-badges.component';
import { AdminMapComponent } from './admin-map/admin-map.component';
import { AdminGuard } from '../../core/guards/admin.guard';

export const ADMIN_ROUTES: Routes = [
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full'
  },
  {
    path: 'dashboard',
    component: YonetimPaneliComponent,
    canActivate: [AdminGuard]
  },
  {
    path: 'requests',
    component: AdminRequestsComponent,
    canActivate: [AdminGuard]
  },
  {
    path: 'volunteers',
    component: AdminVolunteersComponent,
    canActivate: [AdminGuard]
  },
  {
    path: 'badges',
    component: AdminBadgesComponent,
    canActivate: [AdminGuard]
  },
  {
    path: 'map',
    component: AdminMapComponent,
    canActivate: [AdminGuard]
  }
];
