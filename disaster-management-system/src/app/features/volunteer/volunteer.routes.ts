import { Routes } from '@angular/router';
import { VolunteerDashboardComponent } from './volunteer-dashboard/volunteer-dashboard.component';
import { VolunteerProfileComponent } from './volunteer-profile/volunteer-profile.component';
import { VolunteerTasksComponent } from './volunteer-tasks/volunteer-tasks.component';
import { VolunteerMapComponent } from './volunteer-map/volunteer-map.component';
import { VolunteerBadgesComponent } from './volunteer-badges/volunteer-badges.component';
import { VolunteerTeamsComponent } from './volunteer-teams/volunteer-teams.component';
import { VolunteerGuard } from '../../core/guards/volunteer.guard';

export const VOLUNTEER_ROUTES: Routes = [
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full'
  },
  {
    path: 'dashboard',
    component: VolunteerDashboardComponent,
    canActivate: [VolunteerGuard]
  },
  {
    path: 'profile',
    component: VolunteerProfileComponent,
    canActivate: [VolunteerGuard]
  },
  {
    path: 'tasks',
    component: VolunteerTasksComponent,
    canActivate: [VolunteerGuard]
  },
  {
    path: 'map',
    component: VolunteerMapComponent,
    canActivate: [VolunteerGuard]
  },
  {
    path: 'badges',
    component: VolunteerBadgesComponent,
    canActivate: [VolunteerGuard]
  },
  {
    path: 'teams',
    component: VolunteerTeamsComponent,
    canActivate: [VolunteerGuard]
  }
];
