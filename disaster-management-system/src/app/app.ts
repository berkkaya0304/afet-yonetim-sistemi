import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MainNavComponent } from './shared/components/main-nav.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, MainNavComponent],
  template: `
    <app-main-nav></app-main-nav>
    <router-outlet></router-outlet>
  `
})
export class AppComponent {
  title = 'Afet Yönetim Sistemi';
}
