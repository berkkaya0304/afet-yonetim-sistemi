import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { VOLUNTEER_ROUTES } from './volunteer.routes';

// Shared Components
import { RealTimeMapComponent } from '../../shared/components/real-time-map.component';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule.forChild(VOLUNTEER_ROUTES),
    RealTimeMapComponent
  ],
  providers: []
})
export class VolunteerModule { }
