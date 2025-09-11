import { Injectable } from '@angular/core';
import { Router, NavigationStart } from '@angular/router';
import { filter } from 'rxjs/operators';
import { UserRole } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class NavigationGuardService {
  private isInitialized = false;

  constructor(
    private router: Router
  ) {
    this.initializeNavigationGuard();
  }

  private initializeNavigationGuard(): void {
    if (this.isInitialized) return;
    
    // Listen to navigation events
    this.router.events.pipe(
      filter(event => event instanceof NavigationStart)
    ).subscribe((event: NavigationStart) => {
      this.handleNavigationStart(event);
    });

    this.isInitialized = true;
  }

  private handleNavigationStart(event: NavigationStart): void {
    // Get user from localStorage to avoid circular dependency
    const userStr = localStorage.getItem('user');
    if (!userStr) return;
    
    try {
      const user = JSON.parse(userStr);
      const targetUrl = event.url;
      
      // If user is trying to access a different role area, redirect them back
      if (this.isUnauthorizedNavigation(user.role, targetUrl)) {
        this.redirectToAuthorizedArea(user.role);
      }
    } catch (e) {
      console.error('Error parsing user from localStorage:', e);
    }
  }

  private isUnauthorizedNavigation(userRole: UserRole, targetUrl: string): boolean {
    switch (userRole) {
      case UserRole.VATANDAS:
        // Citizens can only access user-related routes
        return targetUrl.startsWith('/admin') || 
               targetUrl.startsWith('/volunteer');
      
      case UserRole.GONULLU:
        // Volunteers can only access volunteer-related routes
        return targetUrl.startsWith('/admin') || 
               targetUrl.startsWith('/user');
      
      case UserRole.YONETICI:
        // Admins can only access admin-related routes
        return targetUrl.startsWith('/user') || 
               targetUrl.startsWith('/volunteer');
      
      default:
        return false;
    }
  }

  private redirectToAuthorizedArea(userRole: UserRole): void {
    switch (userRole) {
      case UserRole.VATANDAS:
        this.router.navigate(['/user/dashboard']);
        break;
      case UserRole.GONULLU:
        this.router.navigate(['/volunteer/dashboard']);
        break;
      case UserRole.YONETICI:
        this.router.navigate(['/admin/dashboard']);
        break;
    }
  }

  // Method to prevent browser back button
  preventBackNavigation(): void {
    // Disable browser back button
    history.pushState(null, '', location.href);
    window.onpopstate = () => {
      history.pushState(null, '', location.href);
      const userStr = localStorage.getItem('user');
      if (userStr) {
        try {
          const user = JSON.parse(userStr);
          this.redirectToAuthorizedArea(user.role);
        } catch (e) {
          console.error('Error parsing user from localStorage:', e);
        }
      }
    };
  }

  // Method to enable browser back button (when logging out)
  enableBackNavigation(): void {
    window.onpopstate = null;
  }
}
