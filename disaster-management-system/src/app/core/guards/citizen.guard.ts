import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { UserRole } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class CitizenGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    const currentUser = this.authService.getCurrentUser();
    
    if (currentUser && currentUser.role === UserRole.VATANDAS) {
      return true;
    }
    
    // Redirect to admin dashboard if user is YONETICI
    if (currentUser && currentUser.role === UserRole.YONETICI) {
      this.router.navigate(['/admin/dashboard']);
      return false;
    }
    
    // Redirect to volunteer dashboard if user is GONULLU
    if (currentUser && currentUser.role === UserRole.GONULLU) {
      this.router.navigate(['/volunteer/dashboard']);
      return false;
    }
    
    // Redirect to login if not authenticated
    this.router.navigate(['/auth/login']);
    return false;
  }
}
