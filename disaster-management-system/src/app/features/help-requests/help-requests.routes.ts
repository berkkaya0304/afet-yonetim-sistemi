import { Routes } from '@angular/router';
import { HelpRequestsListComponent } from './help-requests-list/help-requests-list.component';
import { CreateHelpRequestComponent } from './create-help-request/create-help-request.component';
import { HelpRequestDetailComponent } from './help-request-detail/help-request-detail.component';
import { AuthGuard } from '../../core/guards/auth.guard';

export const HELP_REQUESTS_ROUTES: Routes = [
  {
    path: '',
    component: HelpRequestsListComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'create',
    component: CreateHelpRequestComponent,
    canActivate: [AuthGuard]
  },
  {
    path: ':id',
    component: HelpRequestDetailComponent,
    canActivate: [AuthGuard]
  }
];
