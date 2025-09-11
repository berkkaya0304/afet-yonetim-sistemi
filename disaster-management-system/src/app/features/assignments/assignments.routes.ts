import { Routes } from '@angular/router';
import { AssignmentsListComponent } from './assignments-list/assignments-list.component';
import { AuthGuard } from '../../core/guards/auth.guard';

export const ASSIGNMENTS_ROUTES: Routes = [
  {
    path: '',
    component: AssignmentsListComponent,
    canActivate: [AuthGuard]
  }
];
