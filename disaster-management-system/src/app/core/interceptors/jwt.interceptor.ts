import { HttpInterceptorFn, HttpRequest, HttpHandlerFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';

export const JwtInterceptor: HttpInterceptorFn = (
  request: HttpRequest<unknown>,
  next: HttpHandlerFn
): Observable<any> => {
  const authService = inject(AuthService);
  const router = inject(Router);
  
  const token = authService.getToken();
  let currentUser = authService.getCurrentUser();
  
  if (token) {
    // Try different token formats - some backends expect different formats
    const authHeader = `Bearer ${token}`;
    
    const headers: { [key: string]: string } = {
      Authorization: authHeader,
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };

    // Check if this is a user-related endpoint (expanded to include skills, badges, etc.)
    // But exclude admin endpoints that don't require user ID
    const isUserEndpoint = (
      request.url.includes('/users/') || 
      request.url.includes('/skills/users/') ||
      request.url.includes('/badges/users/') ||
      request.url.includes('/notifications/') ||
      (request.method === 'PUT' && request.url.includes('/users/')) ||
      (request.method === 'POST' && request.url.includes('/users/')) ||
      (request.method === 'DELETE' && request.url.includes('/users/'))
    ) && !(
      // Exclude admin endpoints that don't require user ID
      request.url.includes('/admin/users/all') ||
      request.url.includes('/admin/statistics') ||
      request.url.includes('/admin/announcements') ||
      request.url.includes('/admin/safezones') ||
      request.url.includes('/admin/badges')
    );

    if (isUserEndpoint) {
      let userIdToUse: string | undefined;
      
             // For skills endpoints like /skills/users/1/skills
       if (request.url.includes('/skills/users/')) {
         const urlMatch = request.url.match(/\/skills\/users\/(\d+)/);
         if (urlMatch && urlMatch[1]) {
           userIdToUse = urlMatch[1];
         }
       }
             // For badges endpoints like /badges/users/1/badges
       else if (request.url.includes('/badges/users/')) {
         const urlMatch = request.url.match(/\/badges\/users\/(\d+)/);
         if (urlMatch && urlMatch[1]) {
           userIdToUse = urlMatch[1];
         }
       }
      // For user update operations, try to extract user ID from URL first
      else if (request.method === 'PUT' && request.url.includes('/users/')) {
        const urlMatch = request.url.match(/\/users\/(\d+)/);
        if (urlMatch && urlMatch[1]) {
          userIdToUse = urlMatch[1];
          console.log('JWT Interceptor - Extracted user ID from URL:', userIdToUse);
        }
      }
      // For notifications endpoints
      else if (request.url.includes('/notifications/')) {
        const urlMatch = request.url.match(/\/notifications\/(\w+)\/(\d+)/);
        if (urlMatch && urlMatch[2]) {
          userIdToUse = urlMatch[2];
          console.log('JWT Interceptor - Extracted user ID from notifications URL:', userIdToUse);
        }
      }
      
      // If we still don't have a user ID, try to get it from the request body
      if (!userIdToUse && request.body && typeof request.body === 'object') {
        const body = request.body as any;
        if (body.id && body.id > 0) {
          userIdToUse = body.id.toString();
          console.log('JWT Interceptor - Using user ID from request body:', userIdToUse);
        }
      }
      
      // Final fallback: if we still don't have a user ID, try to extract from any numeric part in the URL
      // But be more specific to avoid getting port numbers or other unrelated numbers
      if (!userIdToUse) {
        // Look for patterns like /users/123, /skills/users/123, etc.
        const patterns = [
          /\/users\/(\d+)/,
          /\/skills\/users\/(\d+)/,
          /\/badges\/users\/(\d+)/,
          /\/notifications\/(\w+)\/(\d+)/
        ];
        
        for (const pattern of patterns) {
          const match = request.url.match(pattern);
          if (match && match[1]) {
            userIdToUse = match[1];
            console.log('JWT Interceptor - Fallback: extracted user ID using pattern:', pattern, 'Result:', userIdToUse);
            break;
          }
        }
      }
      
      if (userIdToUse) {
        headers['X-User-Id'] = userIdToUse;
      }
    }
    
    console.log('JWT Interceptor - Final headers:', headers);
    
    request = request.clone({
      setHeaders: headers
    });
  }

  return next(request).pipe(
    catchError((error: HttpErrorResponse) => {
      console.error('JWT Interceptor - Error:', error);
      if (error.status === 401) {
        // Handle unauthorized access
      }
      return throwError(() => error);
    })
  );
};
