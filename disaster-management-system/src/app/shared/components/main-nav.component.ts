import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, Router, NavigationEnd } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { User, UserRole } from '../../core/models/user.model';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';

interface NavigationItem {
  path: string;
  label: string;
  icon: string;
  roles?: UserRole[];
}

@Component({
  selector: 'app-main-nav',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  template: `
    <nav class="bg-white shadow-lg border-b border-gray-200 sticky top-0 z-50">
      <div class="container-responsive">
        <div class="flex justify-between items-center h-16 lg:h-20">
          <!-- Logo and Brand -->
          <div class="flex items-center">
            <a [routerLink]="getHomePath()" 
               class="flex items-center space-x-3 group"
               [attr.aria-label]="'Ana sayfaya git'">
              <div class="logo-container group-hover:scale-110 transition-all duration-300">
                <!-- Disaster Management Logo -->
                <div class="logo-shield">
                  <svg class="w-full h-full text-white" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z"/>
                  </svg>
                  <!-- Cross Symbol -->
                  <div class="logo-star">
                    <svg class="w-3 h-3 lg:w-4 lg:h-4 text-white" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                    </svg>
                  </div>
                  <!-- Emergency Signal -->
                  <div class="emergency-pulse"></div>
                </div>
              </div>
              <span class="brand-text group-hover:text-blue-600 transition-colors duration-300">
                Afet Yönetim Sistemi
              </span>
            </a>
          </div>

          <!-- Desktop Navigation Links -->
          @if (isLoggedIn()) {
            <div class="hidden lg:flex items-center space-x-1 xl:space-x-2" role="navigation" aria-label="Ana navigasyon">
              @for (item of getNavigationItems(); track item.path) {
                <a [routerLink]="item.path" 
                   routerLinkActive="nav-active"
                   class="nav-link"
                   [attr.aria-label]="item.label">
                  @if (item.icon) {
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" [attr.d]="item.icon" />
                    </svg>
                  }
                  <span>{{ item.label }}</span>
                </a>
              }
            </div>
          }

          <!-- Auth Buttons / User Menu -->
          <div class="flex items-center space-x-2 sm:space-x-4">
            <!-- Unauthenticated State -->
            @if (!isLoggedIn()) {
              <div class="flex items-center space-x-2 sm:space-x-4">
                <a routerLink="/auth/login" 
                   class="auth-link"
                   aria-label="Hesabınıza giriş yapın">
                  Giriş Yap
                </a>
                <a routerLink="/auth/register" 
                   class="btn-primary"
                   aria-label="Yeni hesap oluşturun">
                  Kayıt Ol
                </a>
              </div>
            }

            <!-- Authenticated State -->
            @if (isLoggedIn()) {
              <div class="flex items-center space-x-2 sm:space-x-4">
                <!-- Desktop User Info -->
                <div class="hidden sm:flex items-center space-x-3">
                  <span class="user-name" [attr.aria-label]="'Hoşgeldin ' + currentUser?.fullName">
                    {{ currentUser?.fullName }}
                  </span>
                  <a routerLink="/profile" 
                     class="auth-link"
                     aria-label="Profilinizi görüntüleyin">
                    Profil
                  </a>
                  <button (click)="logout()" 
                          class="btn-danger"
                          aria-label="Sistemden çıkış yapın">
                    Çıkış
                  </button>
                </div>

                <!-- Mobile Menu Button -->
                <button 
                  (click)="toggleMobileMenu()"
                  class="mobile-menu-btn lg:hidden"
                  [attr.aria-expanded]="isMobileMenuOpen"
                  [attr.aria-label]="isMobileMenuOpen ? 'Mobil menüyü kapat' : 'Mobil menüyü aç'"
                  type="button"
                >
                  @if (!isMobileMenuOpen) {
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                  } @else {
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  }
                </button>
              </div>
            }
          </div>
        </div>

        <!-- Mobile Navigation Menu -->
        @if (isLoggedIn() && isMobileMenuOpen) {
          <div class="mobile-menu lg:hidden" 
               role="navigation" 
               aria-label="Mobil navigasyon"
               [class.slide-down]="true">
            <div class="py-4 space-y-2">
              
              <!-- Role-based Mobile Navigation -->
              @if (currentUser?.role) {
                <div class="role-header">
                  <h3 class="role-title">{{ getRoleDisplayName() }}</h3>
                </div>
              }

              @for (item of getNavigationItems(); track item.path) {
                <a [routerLink]="item.path" 
                   routerLinkActive="mobile-nav-active"
                   (click)="closeMobileMenu()"
                   class="mobile-nav-item">
                  <div class="flex items-center space-x-3">
                    @if (item.icon) {
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" [attr.d]="item.icon" />
                      </svg>
                    }
                    <span class="font-medium">{{ item.label }}</span>
                  </div>
                </a>
              }

              <!-- Common Navigation Items -->
              <a routerLink="/notifications" 
                 routerLinkActive="mobile-nav-active"
                 (click)="closeMobileMenu()"
                 class="mobile-nav-item">
                <div class="flex items-center space-x-3">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-5 5-5-5h5v-12h5v12z" />
                  </svg>
                  <span class="font-medium">Bildirimler</span>
                </div>
              </a>
              
              <!-- Mobile User Actions -->
              <div class="user-section">
                <div class="user-info">
                  <div class="user-avatar">
                    <svg class="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <div>
                    <p class="user-full-name">{{ currentUser?.fullName }}</p>
                    <p class="user-email">{{ currentUser?.email }}</p>
                  </div>
                </div>
                
                <div class="user-actions">
                  <a routerLink="/profile" 
                     (click)="closeMobileMenu()"
                     class="user-action-link">
                    Profil
                  </a>
                  <button (click)="logout()" 
                          class="user-action-logout">
                    Çıkış Yap
                  </button>
                </div>
              </div>
            </div>
          </div>
        }
      </div>
    </nav>
  `,
  styles: [`
    /* Container and Layout */
    .container-responsive {
      max-width: 1400px;
      margin: 0 auto;
      padding: 0 1rem;
    }


    /* Logo Styles */
    .logo-container {
      width: 2.5rem;
      height: 2.5rem;
      background: linear-gradient(to bottom right, #2563eb, #7c3aed, #dc2626);
      border-radius: 1rem;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
      position: relative;
    }

    @media (min-width: 1024px) {
      .logo-container {
        width: 3rem;
        height: 3rem;
      }
    }

    .logo-shield {
      position: relative;
      width: 1.5rem;
      height: 1.5rem;
    }

    @media (min-width: 1024px) {
      .logo-shield {
        width: 1.75rem;
        height: 1.75rem;
      }
    }

    .logo-star {
      position: absolute;
      inset: 0;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .emergency-pulse {
      position: absolute;
      top: -0.25rem;
      right: -0.25rem;
      width: 0.5rem;
      height: 0.5rem;
      background-color: #ef4444;
      border-radius: 50%;
      animation: pulse 2s infinite;
    }

    @media (min-width: 1024px) {
      .emergency-pulse {
        width: 0.75rem;
        height: 0.75rem;
      }
    }

    .brand-text {
      font-size: 1.125rem;
      font-weight: 700;
      color: #111827;
    }

    @media (min-width: 1024px) {
      .brand-text {
        font-size: 1.25rem;
      }
    }

    @media (min-width: 1280px) {
      .brand-text {
        font-size: 1.5rem;
      }
    }

    /* Navigation Styles */
    .nav-link {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      color: #374151;
      padding: 0.5rem 0.75rem;
      font-size: 0.875rem;
      font-weight: 500;
      border-bottom: 2px solid transparent;
      border-radius: 0.5rem 0.5rem 0 0;
      transition: all 0.2s;
      text-decoration: none;
    }

    .nav-link:hover {
      color: #2563eb;
      background-color: #eff6ff;
      border-bottom-color: #2563eb;
    }

    .nav-active {
      color: #2563eb !important;
      border-bottom-color: #2563eb !important;
      background-color: #eff6ff !important;
    }

    /* Button Styles */
    .btn-primary {
      background: linear-gradient(to right, #2563eb, #7c3aed);
      color: white;
      font-weight: 600;
      padding: 0.5rem 1rem;
      border-radius: 0.5rem;
      transition: all 0.3s;
      text-decoration: none;
      display: inline-block;
      border: none;
      cursor: pointer;
    }

    .btn-primary:hover {
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
      transform: scale(1.05);
    }

    .btn-danger {
      background: linear-gradient(to right, #dc2626, #ec4899);
      color: white;
      font-weight: 600;
      padding: 0.5rem 1rem;
      border-radius: 0.5rem;
      transition: all 0.3s;
      border: none;
      cursor: pointer;
    }

    .btn-danger:hover {
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
      transform: scale(1.05);
    }

    .auth-link {
      color: #374151;
      padding: 0.5rem 0.75rem;
      font-size: 0.875rem;
      font-weight: 500;
      transition: all 0.2s;
      text-decoration: none;
      border-radius: 0.5rem;
    }

    .auth-link:hover {
      color: #2563eb;
      background-color: #f9fafb;
    }

    .user-name {
      color: #374151;
      font-size: 0.875rem;
      font-weight: 500;
    }

    /* Mobile Menu */
    .mobile-menu-btn {
      padding: 0.5rem;
      border-radius: 0.5rem;
      color: #374151;
      transition: all 0.2s;
      border: none;
      background: none;
      cursor: pointer;
    }

    .mobile-menu-btn:hover {
      color: #2563eb;
      background-color: #f3f4f6;
    }

    .mobile-menu-btn:focus {
      outline: none;
      box-shadow: 0 0 0 2px #3b82f6, 0 0 0 4px white;
    }

    .mobile-menu {
      border-top: 1px solid #e5e7eb;
      background-color: white;
      animation: slideDown 0.3s ease-out;
    }

    .role-header {
      border-left: 4px solid #3b82f6;
      background-color: #eff6ff;
      margin: 0 1rem;
      padding: 0.5rem 1rem;
      margin-bottom: 1rem;
    }

    .role-title {
      font-size: 0.875rem;
      font-weight: 600;
      color: #1d4ed8;
    }

    .mobile-nav-item {
      display: block;
      padding: 0.75rem 1rem;
      color: #374151;
      border-left: 4px solid transparent;
      transition: all 0.2s;
      text-decoration: none;
    }

    .mobile-nav-item:hover {
      color: #2563eb;
      background-color: #eff6ff;
      border-left-color: #2563eb;
    }

    .mobile-nav-active {
      color: #2563eb !important;
      background-color: #eff6ff !important;
      border-left-color: #2563eb !important;
    }

    /* User Section */
    .user-section {
      border-top: 1px solid #e5e7eb;
      padding-top: 1rem;
      margin-top: 1rem;
    }

    .user-info {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      margin-bottom: 1rem;
      padding: 0 1rem;
    }

    .user-avatar {
      width: 2.5rem;
      height: 2.5rem;
      background-color: #dbeafe;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .user-full-name {
      font-size: 0.875rem;
      font-weight: 500;
      color: #111827;
    }

    .user-email {
      font-size: 0.75rem;
      color: #6b7280;
    }

    .user-actions {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .user-action-link,
    .user-action-logout {
      display: block;
      width: 100%;
      text-align: left;
      padding: 0.5rem 1rem;
      font-size: 0.875rem;
      border-radius: 0.5rem;
      transition: all 0.2s;
      text-decoration: none;
      border: none;
      background: none;
      cursor: pointer;
    }

    .user-action-link {
      color: #374151;
    }

    .user-action-link:hover {
      color: #2563eb;
      background-color: #eff6ff;
    }

    .user-action-logout {
      color: #dc2626;
    }

    .user-action-logout:hover {
      color: #b91c1c;
      background-color: #fef2f2;
    }

    /* Animations */
    @keyframes pulse {
      0%, 100% {
        opacity: 1;
      }
      50% {
        opacity: 0.5;
      }
    }

    @keyframes slideDown {
      from {
        opacity: 0;
        transform: translateY(-10px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    /* Responsive Design */
    @media (max-width: 1024px) {
      .container-responsive {
        padding: 0 0.75rem;
      }
    }

    @media (max-width: 768px) {
      .container-responsive {
        padding: 0 0.5rem;
      }

      .brand-text {
        font-size: 1rem;
      }
    }

    @media (max-width: 640px) {
      .brand-text {
        display: none;
      }
    }
  `]
})
export class MainNavComponent implements OnInit, OnDestroy {
  currentUser: User | null = null;
  isMobileMenuOpen = false;
  private userSubscription: Subscription | null = null;
  private routerSubscription: Subscription | null = null;

  private readonly adminNavigation: NavigationItem[] = [
    { path: '/admin/dashboard', label: 'Yönetim Paneli', icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' },
    { path: '/admin/requests', label: 'Yardım Talepleri', icon: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z' },
    { path: '/admin/volunteers', label: 'Gönüllüler', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z' },
    { path: '/admin/badges', label: 'Rozetler', icon: 'M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z' },
    { path: '/admin/map', label: 'Harita', icon: 'M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-1.447-.894L15 4m0 13V4m-6 3l6-3' }
  ];

  private readonly volunteerNavigation: NavigationItem[] = [
    { path: '/volunteer/dashboard', label: 'Gönüllü Paneli', icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' },
    { path: '/volunteer/tasks', label: 'Görevlerim', icon: 'M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' },
    { path: '/volunteer/teams', label: 'Ekiplerim', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z' },
    { path: '/volunteer/map', label: 'Harita', icon: 'M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-1.447-.894L15 4m0 13V4m-6 3l6-3' },
    { path: '/volunteer/badges', label: 'Rozetlerim', icon: 'M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z' }
  ];

  private readonly userNavigation: NavigationItem[] = [
    { path: '/user/dashboard', label: 'Vatandaş Paneli', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 11-6 0 3 3 0 016 0z' },
    { path: '/help-requests', label: 'Yardım Talepleri', icon: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z' },
    { path: '/safezones', label: 'Güvenli Bölgeler', icon: 'M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z M15 11a3 3 0 11-6 0 3 3 0 016 0z' }
  ];

  private readonly generalNavigation: NavigationItem[] = [
    { path: '/help-requests', label: 'Yardım Talepleri', icon: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z' },
    { path: '/assignments', label: 'Görevler', icon: 'M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' },
    { path: '/safezones', label: 'Güvenli Bölgeler', icon: 'M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z M15 11a3 3 0 11-6 0 3 3 0 016 0z' }
  ];

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.setupSubscriptions();
  }

  ngOnDestroy(): void {
    this.cleanupSubscriptions();
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event): void {
    const target = event.target as HTMLElement;
    // Sadece mobil menü açıkken ve menü dışına tıklandığında kapat
    if (this.isMobileMenuOpen && !target.closest('.mobile-menu') && !target.closest('.mobile-menu-btn')) {
      this.closeMobileMenu();
    }
  }

  // ... existing code ...
  @HostListener('window:resize')
  onWindowResize(): void {
    if (window.innerWidth >= 1024 && this.isMobileMenuOpen) {
      console.log('Window resized to desktop size, closing mobile menu');
      this.closeMobileMenu();
    }
  }
// ... existing code ...

  private setupSubscriptions(): void {
    this.userSubscription = this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
    });

    this.routerSubscription = this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        this.closeMobileMenu();
      });
  }

  private cleanupSubscriptions(): void {
    this.userSubscription?.unsubscribe();
    this.routerSubscription?.unsubscribe();
  }

  isLoggedIn(): boolean {
    return this.authService.isAuthenticated();
  }

  isAdmin(): boolean {
    return this.currentUser?.role === UserRole.YONETICI;
  }

  isVolunteer(): boolean {
    return this.currentUser?.role === UserRole.GONULLU;
  }

  isUser(): boolean {
    return this.currentUser?.role === UserRole.VATANDAS;
  }

  getHomePath(): string {
    if (!this.isLoggedIn()) return '/';
    
    if (this.isAdmin()) return '/admin/dashboard';
    if (this.isVolunteer()) return '/volunteer/dashboard';
    if (this.isUser()) return '/user/dashboard';
    return '/';
  }

  getNavigationItems(): NavigationItem[] {
    if (this.isAdmin()) return this.adminNavigation;
    if (this.isVolunteer()) return this.volunteerNavigation;
    if (this.isUser()) return this.userNavigation;
    return this.generalNavigation;
  }

  getRoleDisplayName(): string {
    if (this.isAdmin()) return 'Yönetici Menüsü';
    if (this.isVolunteer()) return 'Gönüllü Menüsü';
    if (this.isUser()) return 'Vatandaş Menüsü';
    return 'Ana Menü';
  }

  toggleMobileMenu(): void {
    console.log('Toggle mobile menu called, current state:', this.isMobileMenuOpen);
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
    console.log('New state:', this.isMobileMenuOpen);
  }

  closeMobileMenu(): void {
    console.log('Close mobile menu called, current state:', this.isMobileMenuOpen);
    this.isMobileMenuOpen = false;
    console.log('Menu closed, new state:', this.isMobileMenuOpen);
  }

  logout(): void {
    this.closeMobileMenu();
    this.authService.logout();
    this.router.navigate(['/']);
  }
}