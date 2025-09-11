import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { UserRole } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AdminGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    const currentUser = this.authService.getCurrentUser();
    
    console.log('AdminGuard - Current User:', currentUser);
    console.log('AdminGuard - Current User Role:', currentUser?.role);
    console.log('AdminGuard - Expected Role:', UserRole.YONETICI);
    console.log('AdminGuard - Role Match:', currentUser?.role === UserRole.YONETICI);
    
    if (currentUser && currentUser.role === UserRole.YONETICI) {
      console.log('AdminGuard - Access granted for admin');
      return true;
    }
    
    // Redirect to volunteer dashboard if user is GONULLU
    if (currentUser && currentUser.role === UserRole.GONULLU) {
      console.log('AdminGuard - Redirecting volunteer to volunteer dashboard');
      this.router.navigate(['/volunteer/dashboard']);
      return false;
    }
    
    // Redirect to user panel if user is VATANDAS
    if (currentUser && currentUser.role === UserRole.VATANDAS) {
      console.log('AdminGuard - Redirecting citizen to user panel');
      this.router.navigate(['/user']);
      return false;
    }
    
    // Redirect to login if not authenticated
    console.log('AdminGuard - Redirecting to login (not authenticated or wrong role)');
    this.router.navigate(['/auth/login']);
    return false;
  }
}
