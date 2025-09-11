import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { User, UserRole } from '../models/user.model';
import { ApiService } from './api.service';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  fullName: string;
  email: string;
  password: string;
  phone_number?: string;
  role: UserRole;
}

export interface AuthResponse {
  token: string;
  user: User;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(
    private http: HttpClient,
    private apiService: ApiService
  ) {
    this.loadStoredUser();
  }

  login(credentials: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(this.apiService.getApiUrl('/auth/login'), credentials)
      .pipe(
        tap((response) => {
          console.log('Login Response:', response);
          console.log('Login Response User:', response.user);
          console.log('Login Response Token:', response.token);
          
          if (response.token) {
            this.storeToken(response.token);
            
            if (response.user && response.user.role) {
              console.log('Storing user from response with role:', response.user.role);
              this.storeUser(response.user);
              this.currentUserSubject.next(response.user);
            } else {
              console.log('No user or role in response, fetching user details...');
              // If user object is missing or has no role, try to fetch user details
              this.fetchUserDetailsAfterLogin();
            }
          }
        })
      );
  }

  register(userData: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(this.apiService.getApiUrl('/auth/register'), userData);
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.currentUserSubject.next(null);
    // Clear any other stored data
    sessionStorage.clear();
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  getToken(): string | null {
    const token = localStorage.getItem('token');
    return token;
  }

  getCurrentUser(): User | null {
    const user = this.currentUserSubject.value;
    console.log('getCurrentUser - Retrieved user:', user);
    console.log('getCurrentUser - User role:', user?.role);
    return user;
  }

  async getRedirectPath(): Promise<string> {
    // Kullanıcı verisi yüklenene kadar bekle
    let currentUser = this.getCurrentUser();
    let attempts = 0;
    const maxAttempts = 20; // Increased max attempts
    
    while (!currentUser?.role && attempts < maxAttempts) {
      await this.delay(200); // Increased delay to 200ms
      currentUser = this.getCurrentUser();
      attempts++;
      console.log(`getRedirectPath - Attempt ${attempts}: User role not found, waiting...`);
    }
    
    console.log('getRedirectPath - Final current user:', currentUser);
    console.log('getRedirectPath - User role:', currentUser?.role);
    
    if (!currentUser?.role) {
      console.log('getRedirectPath - No current user after all attempts, redirecting to login');
      return '/auth/login';
    }
    
    console.log('getRedirectPath - Role comparison:');
    console.log('getRedirectPath - Current user role:', currentUser.role);
    console.log('getRedirectPath - Current user role type:', typeof currentUser.role);
    console.log('getRedirectPath - UserRole.YONETICI:', UserRole.YONETICI);
    console.log('getRedirectPath - UserRole.GONULLU:', UserRole.GONULLU);
    console.log('getRedirectPath - UserRole.VATANDAS:', UserRole.VATANDAS);
    console.log('getRedirectPath - Role === YONETICI:', currentUser.role === UserRole.YONETICI);
    console.log('getRedirectPath - Role === GONULLU:', currentUser.role === UserRole.GONULLU);
    console.log('getRedirectPath - Role === VATANDAS:', currentUser.role === UserRole.VATANDAS);
    console.log('getRedirectPath - Role string comparison YONETICI:', currentUser.role === 'YONETICI');
    console.log('getRedirectPath - Role string comparison GONULLU:', currentUser.role === 'GONULLU');
    console.log('getRedirectPath - Role string comparison VATANDAS:', currentUser.role === 'VATANDAS');
    
    switch (currentUser.role) {
      case UserRole.YONETICI:
        console.log('getRedirectPath - Redirecting to admin dashboard');
        return '/admin/dashboard';
      case UserRole.GONULLU:
        console.log('getRedirectPath - Redirecting to volunteer dashboard');
        return '/volunteer/dashboard';
      case UserRole.VATANDAS:
        console.log('getRedirectPath - Redirecting to user panel');
        return '/user/dashboard';
      default:
        console.log('getRedirectPath - Unknown role, redirecting to user panel');
        return '/user/dashboard';
    }
  }

  private storeToken(token: string): void {
    localStorage.setItem('token', token);
  }

  private storeUser(user: User): void {
    console.log('storeUser - Storing user:', user);
    console.log('storeUser - User role:', user.role);
    localStorage.setItem('user', JSON.stringify(user));
    console.log('storeUser - User stored in localStorage');
  }

  

  private loadStoredUser(): void {
    const userStr = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    
    if (userStr && token) {
      try {
        const user = JSON.parse(userStr);
        this.currentUserSubject.next(user);
      } catch (e) {
        console.error('Error parsing stored user:', e);
        localStorage.removeItem('user');
        localStorage.removeItem('token');
      }
    }
  }
  

  refreshToken(): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(this.apiService.getApiUrl('/auth/refresh'), {});
  }

  private fetchUserDetailsAfterLogin(): void {
    console.log('fetchUserDetailsAfterLogin - Starting to fetch user details...');
    
    // First, try to decode JWT token immediately to get basic user info
    console.log('fetchUserDetailsAfterLogin - Trying to decode JWT token first...');
    const basicUserInfo = this.decodeJwtToken();
    if (basicUserInfo) {
      console.log('fetchUserDetailsAfterLogin - Successfully decoded JWT token, user info:', basicUserInfo);
      console.log('fetchUserDetailsAfterLogin - User role from JWT:', basicUserInfo.role);
      this.storeUser(basicUserInfo);
      this.currentUserSubject.next(basicUserInfo);
      console.log('fetchUserDetailsAfterLogin - Basic user stored and subject updated from JWT');
      return; // Exit early if we successfully got user info from JWT
    }
    
    // If JWT decoding failed, try the API endpoint
    console.log('fetchUserDetailsAfterLogin - JWT decoding failed, trying API endpoint...');
    this.http.get<User>(this.apiService.getApiUrl('/users/me'))
      .subscribe({
        next: (user) => {
          console.log('fetchUserDetailsAfterLogin - Fetched user details from /users/me:', user);
          console.log('fetchUserDetailsAfterLogin - User role:', user.role);
          this.storeUser(user);
          this.currentUserSubject.next(user);
          console.log('fetchUserDetailsAfterLogin - User stored and subject updated from API');
        },
        error: (error) => {
          console.error('fetchUserDetailsAfterLogin - Failed to fetch user details from API:', error);
          console.warn('fetchUserDetailsAfterLogin - Could not get user info from either JWT or API');
        }
      });
  }

  private decodeJwtToken(): User | null {
    try {
      const token = this.getToken();
      if (!token) {
        console.log('decodeJwtToken - No token found');
        return null;
      }
      
      console.log('decodeJwtToken - Token found, length:', token.length);
      
      // JWT tokens have 3 parts separated by dots
      const parts = token.split('.');
      console.log('decodeJwtToken - Token parts count:', parts.length);
      
      if (parts.length !== 3) {
        console.log('decodeJwtToken - Invalid token format, expected 3 parts');
        return null;
      }
      
      // Decode the payload (second part) - handle base64url encoding
      const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
      console.log('decodeJwtToken - Base64 payload:', base64);
      
      const payload = JSON.parse(this.base64Decode(base64));
      
      console.log('JWT Token Payload:', payload);
      console.log('JWT Token Payload Keys:', Object.keys(payload));
      console.log('JWT Token Roles:', payload.roles);
      console.log('JWT Token Role:', payload.role);
      console.log('JWT Token Subject:', payload.sub);
      console.log('JWT Token Email:', payload.email);
      
      // Try different possible role fields
      let roleValue = null;
      if (payload.roles && Array.isArray(payload.roles) && payload.roles.length > 0) {
        roleValue = payload.roles[0];
        console.log('decodeJwtToken - Found role in roles array:', roleValue);
      } else if (payload.role) {
        roleValue = payload.role;
        console.log('decodeJwtToken - Found role in role field:', roleValue);
      } else if (payload.authorities && Array.isArray(payload.authorities) && payload.authorities.length > 0) {
        roleValue = payload.authorities[0];
        console.log('decodeJwtToken - Found role in authorities array:', roleValue);
      } else {
        console.log('decodeJwtToken - No role found in any expected field');
        return null;
      }
      
      // Extract user information from payload
      if (payload.sub || payload.email) {
        const mappedRole = this.mapRoleFromToken(roleValue);
        console.log('Mapped Role:', mappedRole, 'from token role:', roleValue);
        
        const user: User = {
          id: payload.id || 0,
          fullName: payload.name || payload.sub || payload.email || 'Unknown',
          email: payload.email || payload.sub || 'unknown@email.com',
          password_hash: '',
          role: mappedRole,
          created_at: new Date()
        };
        
        console.log('Created User from JWT:', user);
        return user;
      }
    } catch (error) {
      console.error('Error decoding JWT token:', error);
    }
    return null;
  }

  private base64Decode(str: string): string {
    try {
      // Try using atob first (standard browser API)
      return atob(str);
    } catch (e) {
      // Fallback for environments where atob is not available
      console.warn('atob not available, using custom base64 decode');
      return decodeURIComponent(escape(window.atob ? window.atob(str) : str));
    }
  }

  private mapRoleFromToken(role: string): UserRole {
    console.log('mapRoleFromToken - Input role:', role);
    console.log('mapRoleFromToken - Input role type:', typeof role);
    console.log('mapRoleFromToken - Input role length:', role?.length);
    console.log('mapRoleFromToken - Input role char codes:', role?.split('').map(c => c.charCodeAt(0)));
    
    if (!role || typeof role !== 'string') {
      console.log('mapRoleFromToken - Invalid role input, defaulting to VATANDAS');
      return UserRole.VATANDAS;
    }
    
    // Remove ROLE_ prefix if it exists
    const cleanRole = role.replace('ROLE_', '');
    console.log('mapRoleFromToken - Cleaned role:', cleanRole);
    
    // Also check for lowercase versions
    const normalizedRole = cleanRole.toUpperCase();
    console.log('mapRoleFromToken - Normalized role:', normalizedRole);
    
    // Try exact matches first
    switch (normalizedRole) {
      case 'VATANDAS':
        console.log('mapRoleFromToken - Exact match for VATANDAS');
        return UserRole.VATANDAS;
      case 'GONULLU':
        console.log('mapRoleFromToken - Exact match for GONULLU');
        return UserRole.GONULLU;
      case 'YONETICI':
        console.log('mapRoleFromToken - Exact match for YONETICI');
        return UserRole.YONETICI;
    }
    
    // Try partial matches
    if (normalizedRole.includes('VATANDAS') || normalizedRole.includes('CITIZEN') || normalizedRole.includes('USER')) {
      console.log('mapRoleFromToken - Partial match for VATANDAS');
      return UserRole.VATANDAS;
    }
    
    if (normalizedRole.includes('GONULLU') || normalizedRole.includes('VOLUNTEER')) {
      console.log('mapRoleFromToken - Partial match for GONULLU');
      return UserRole.GONULLU;
    }
    
    if (normalizedRole.includes('YONETICI') || normalizedRole.includes('ADMIN') || normalizedRole.includes('MANAGER')) {
      console.log('mapRoleFromToken - Partial match for YONETICI');
      return UserRole.YONETICI;
    }
    
    console.log('mapRoleFromToken - No match found, defaulting to VATANDAS for role:', role);
    return UserRole.VATANDAS;
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
