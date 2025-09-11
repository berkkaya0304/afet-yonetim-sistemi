import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { NotificationService } from '../../../core/services/notification.service';
import { NavigationGuardService } from '../../../core/services/navigation-guard.service';
import { AdminService, AdminStatistics, Announcement } from '../../../core/services/admin.service';
import { User, UserRole } from '../../../core/models/user.model';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-yonetim-paneli',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="min-h-screen bg-gray-100">
      <header class="bg-white shadow">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="py-6">
            <h1 class="text-3xl font-bold text-gray-900">Yönetim Paneli</h1>
            <p class="text-gray-600 mt-2">Sistem yönetimi ve kontrol paneli</p>
          </div>
        </div>
      </header>

      <main class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <!-- Dashboard Overview Cards -->
        @if (isLoading) {
          <div class="col-span-full flex justify-center items-center py-12">
            <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          </div>
        } @else {
          <!-- Refresh Button -->
          <div class="flex justify-end mb-4">
            <button 
              (click)="refreshStatistics()" 
              [disabled]="isRefreshing"
              class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center"
            >
              <svg *ngIf="isRefreshing" class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              {{ isRefreshing ? 'Yenileniyor...' : 'İstatistikleri Yenile' }}
            </button>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div class="bg-white shadow rounded-lg p-6">
              <div class="flex items-center">
                <div class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <div class="ml-4">
                  <p class="text-sm font-medium text-gray-600">Toplam Yardım Talebi</p>
                  <p class="text-2xl font-bold text-gray-900">{{ statistics.totalHelpRequests }}</p>
                </div>
              </div>
            </div>

            <div class="bg-white shadow rounded-lg p-6">
              <div class="flex items-center">
                <div class="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <div class="ml-4">
                  <p class="text-sm font-medium text-gray-600">Aktif Gönüllü</p>
                  <p class="text-2xl font-bold text-gray-900">{{ statistics.activeVolunteers }}</p>
                </div>
              </div>
            </div>

            <div class="bg-white shadow rounded-lg p-6">
              <div class="flex items-center">
                <div class="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <svg class="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div class="ml-4">
                  <p class="text-sm font-medium text-gray-600">Tamamlanan Görevler</p>
                  <p class="text-2xl font-bold text-gray-900">{{ statistics.completedTasks }}</p>
                </div>
              </div>
            </div>

            <div class="bg-white shadow rounded-lg p-6">
              <div class="flex items-center">
                <div class="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <svg class="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <div class="ml-4">
                  <p class="text-sm font-medium text-gray-600">Güvenli Bölgeler</p>
                  <p class="text-2xl font-bold text-gray-900">{{ statistics.safeZones }}</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Quick Actions Grid -->
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <!-- Request Management -->
            <div class="bg-white shadow rounded-lg p-6">
              <div class="flex items-center mb-4">
                <div class="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                  <svg class="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <h3 class="text-lg font-semibold text-gray-900 ml-3">Talep Yönetimi</h3>
              </div>
              <p class="text-gray-600 mb-4">Yardım taleplerini yönetin, doğrulayın ve önceliklendirin</p>
              <div class="space-y-2">
                <a routerLink="/admin/requests" class="block w-full text-center bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors">
                  Talepleri Görüntüle
                </a>
              </div>
            </div>

            <!-- Volunteer Management -->
            <div class="bg-white shadow rounded-lg p-6">
              <div class="flex items-center mb-4">
                <div class="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <svg class="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h3 class="text-lg font-semibold text-gray-900 ml-3">Gönüllü Yönetimi</h3>
              </div>
              <p class="text-gray-600 mb-4">Gönüllülerin yetkinliklerini ve konumlarını takip edin</p>
              <div class="space-y-2">
                <a routerLink="/admin/volunteers" class="block w-full text-center bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors">
                  Gönüllüleri Görüntüle
                </a>
              </div>
            </div>

            <!-- Announcements -->
            <div class="bg-white shadow rounded-lg p-6">
              <div class="flex items-center mb-4">
                <div class="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5.88V14m0-4.92v4.92m0-4.92a3 3 0 100-6 3 3 0 000 6z" />
                  </svg>
                </div>
                <h3 class="text-lg font-semibold text-gray-900 ml-3">Duyuru/Bildirim</h3>
              </div>
              <p class="text-gray-600 mb-4">Bölgeye özel veya genel duyurular gönderin</p>
              <div class="space-y-2">
                <button (click)="openAnnouncementModal()" class="block w-full text-center bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors">
                  Duyuru Gönder
                </button>
              </div>
            </div>

            <!-- Map Management -->
            <div class="bg-white shadow rounded-lg p-6">
              <div class="flex items-center mb-4">
                <div class="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <svg class="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-1.447-.894L15 4m0 13V4m-6 3l6-3" />
                  </svg>
                </div>
                <h3 class="text-lg font-semibold text-gray-900 ml-3">Harita Yönetimi</h3>
              </div>
              <p class="text-gray-600 mb-4">Toplanma alanları ve dağıtım noktalarını yönetin</p>
              <div class="space-y-2">
                <a routerLink="/admin/map" class="block w-full text-center bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 transition-colors">
                  Haritayı Görüntüle
                </a>
              </div>
            </div>

            <!-- Badge Management -->
            <div class="bg-white shadow rounded-lg p-6">
              <div class="flex items-center mb-4">
                <div class="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <svg class="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                  </svg>
                </div>
                <h3 class="text-lg font-semibold text-gray-900 ml-3">Rozet Yönetimi</h3>
              </div>
              <p class="text-gray-600 mb-4">Rozet oluşturun, düzenleyin ve manuel olarak atayın</p>
              <div class="space-y-2">
                <a routerLink="/admin/badges" class="block w-full text-center bg-yellow-600 text-white px-4 py-2 rounded-md hover:bg-yellow-700 transition-colors">
                  Rozetleri Yönet
                </a>
              </div>
            </div>
          </div>

          <!-- Recent Activity -->
          @if (recentActivities.length > 0) {
            <div class="bg-white shadow rounded-lg p-6">
              <h2 class="text-xl font-semibold text-gray-900 mb-6">Son Aktiviteler</h2>
              <div class="space-y-4">
                @for (activity of recentActivities; track activity.id) {
                  <div class="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                    <div class="w-10 h-10 rounded-full flex items-center justify-center"
                         [ngClass]="{
                           'bg-blue-100': activity.type === 'REQUEST',
                           'bg-green-100': activity.type === 'VOLUNTEER',
                           'bg-yellow-100': activity.type === 'BADGE',
                           'bg-purple-100': activity.type === 'SAFEZONE'
                         }">
                      <svg class="w-5 h-5" 
                           [ngClass]="{
                             'text-blue-600': activity.type === 'REQUEST',
                             'text-green-600': activity.type === 'VOLUNTEER',
                             'text-yellow-600': activity.type === 'BADGE',
                             'text-purple-600': activity.type === 'SAFEZONE'
                           }"
                           fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                      </svg>
                    </div>
                    <div class="flex-1">
                      <p class="text-sm font-medium text-gray-900">{{ activity.description }}</p>
                      <p class="text-xs text-gray-500">{{ activity.timestamp | date:'dd/MM/yyyy HH:mm' }}</p>
                    </div>
                    <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium"
                          [ngClass]="{
                            'bg-blue-100 text-blue-800': activity.type === 'REQUEST',
                            'bg-green-100 text-green-800': activity.type === 'VOLUNTEER',
                            'bg-yellow-100 text-yellow-800': activity.type === 'BADGE',
                            'bg-purple-100 text-purple-800': activity.type === 'SAFEZONE'
                          }">
                      {{ getActivityTypeLabel(activity.type) }}
                    </span>
                  </div>
                }
              </div>
            </div>
          }
        }
      </main>

      <!-- Announcement Modal -->
      @if (showAnnouncementModal) {
        <div class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div class="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div class="mt-3">
              <h3 class="text-lg font-medium text-gray-900 mb-4">Sistem Duyurusu Gönder</h3>
              <form (ngSubmit)="sendAnnouncement()" class="space-y-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Duyuru Türü</label>
                  <select [(ngModel)]="announcementForm.type" name="type" class="w-full px-3 py-2 border border-gray-300 rounded-md">
                    <option value="INFO">Bilgi</option>
                    <option value="WARNING">Uyarı</option>
                    <option value="EMERGENCY">Acil Durum</option>
                  </select>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Başlık</label>
                  <input type="text" [(ngModel)]="announcementForm.title" name="title" class="w-full px-3 py-2 border border-gray-300 rounded-md" required>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Mesaj</label>
                  <textarea [(ngModel)]="announcementForm.message" name="message" rows="3" class="w-full px-3 py-2 border border-gray-300 rounded-md" required></textarea>
                </div>
                <div class="flex justify-end space-x-3">
                  <button type="button" (click)="closeAnnouncementModal()" class="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400">
                    İptal
                  </button>
                  <button type="submit" [disabled]="!announcementForm.title || !announcementForm.message || isSubmitting" class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50">
                    {{ isSubmitting ? 'Gönderiliyor...' : 'Gönder' }}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      }
    </div>
  `
})
export class YonetimPaneliComponent implements OnInit, OnDestroy {
  currentUser: User | null = null;
  showAnnouncementModal = false;
  isLoading = false;
  isSubmitting = false;
  isRefreshing = false;
  
  statistics: AdminStatistics = {
    totalHelpRequests: 0,
    activeVolunteers: 0,
    completedTasks: 0,
    safeZones: 0,
    pendingRequests: 0,
    totalUsers: 0
  };

  announcementForm: Announcement = {
    type: 'INFO',
    title: '',
    message: ''
  };

  recentActivities: any[] = [];
  private subscriptions = new Subscription();

  constructor(
    private authService: AuthService,
    private adminService: AdminService,
    private notificationService: NotificationService,
    private navigationGuardService: NavigationGuardService
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    this.loadStatistics();
    this.loadRecentActivities();
    
    // Ensure navigation guard is active for this component
    this.navigationGuardService.preventBackNavigation();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  openAnnouncementModal(): void {
    this.showAnnouncementModal = true;
  }

  closeAnnouncementModal(): void {
    this.showAnnouncementModal = false;
    this.announcementForm = { type: 'INFO', title: '', message: '' };
  }

  sendAnnouncement(): void {
    if (!this.announcementForm.title || !this.announcementForm.message) {
      return;
    }

    this.isSubmitting = true;
    const subscription = this.adminService.createAnnouncement(this.announcementForm).subscribe({
      next: () => {
        this.notificationService.showSuccess('Duyuru başarıyla gönderildi!');
        this.closeAnnouncementModal();
        this.loadRecentActivities();
        this.isSubmitting = false;
      },
      error: (error) => {
        console.error('Duyuru gönderilirken hata oluştu:', error);
        this.notificationService.showError('Duyuru gönderilirken hata oluştu!');
        this.isSubmitting = false;
      }
    });
    this.subscriptions.add(subscription);
  }

  refreshStatistics(): void {
    this.isRefreshing = true;
    this.loadStatistics();
    this.loadRecentActivities();
    this.notificationService.showSuccess('İstatistikler yenilendi!');
    setTimeout(() => {
      this.isRefreshing = false;
    }, 1000); // Refresh animation duration
  }

  private loadStatistics(): void {
    this.isLoading = true;
    console.log('Loading dashboard statistics...');
    
    const subscription = this.adminService.getDashboardStatistics().subscribe({
      next: (stats) => {
        console.log('Statistics received:', stats);
        
        // Map API response to component properties
        this.statistics = {
          totalHelpRequests: stats.totalHelpRequests || 0,
          activeVolunteers: stats.activeVolunteers || 0,
          completedTasks: stats.completedTasks || 0,
          safeZones: stats.safeZones || 0,
          pendingRequests: stats.pendingRequests || 0,
          totalUsers: stats.totalUsers || 0
        };
        
        console.log('Mapped statistics:', this.statistics);
        this.isLoading = false;
      },
      error: (error) => {
        console.error('İstatistikler yüklenirken hata oluştu:', error);
        this.notificationService.showError('İstatistikler yüklenirken hata oluştu!');
        
        // Try to load individual statistics as fallback
        this.loadFallbackStatistics();
        this.isLoading = false;
      }
    });
    this.subscriptions.add(subscription);
  }

  private loadFallbackStatistics(): void {
    console.log('Loading fallback statistics...');
    
    // Load individual statistics as fallback
    const requestsSub = this.adminService.getHelpRequests().subscribe({
      next: (requests) => {
        console.log('Help requests loaded:', requests.length);
        this.statistics.totalHelpRequests = requests.length;
        this.statistics.pendingRequests = requests.filter(r => r.status === 'PENDING').length;
      },
      error: (err) => console.error('Error loading help requests:', err)
    });

    const volunteersSub = this.adminService.getVolunteers().subscribe({
      next: (volunteers) => {
        console.log('Volunteers loaded:', volunteers.length);
        this.statistics.activeVolunteers = volunteers.filter(v => v.isActive).length;
      },
      error: (err) => console.error('Error loading volunteers:', err)
    });

    const assignmentsSub = this.adminService.getAssignments('COMPLETED').subscribe({
      next: (assignments) => {
        console.log('Completed assignments loaded:', assignments.length);
        this.statistics.completedTasks = assignments.length;
      },
      error: (err) => console.error('Error loading assignments:', err)
    });

    const safezonesSub = this.adminService.getSafeZones().subscribe({
      next: (safezones) => {
        console.log('Safezones loaded:', safezones.length);
        this.statistics.safeZones = safezones.filter(s => s.isActive).length;
      },
      error: (err) => console.error('Error loading safezones:', err)
    });

    const usersSub = this.adminService.getAllUsers().subscribe({
      next: (users) => {
        console.log('Users loaded:', users.length);
        this.statistics.totalUsers = users.length;
      },
      error: (err) => console.error('Error loading users:', err)
    });

    // Add all subscriptions
    this.subscriptions.add(requestsSub);
    this.subscriptions.add(volunteersSub);
    this.subscriptions.add(assignmentsSub);
    this.subscriptions.add(safezonesSub);
    this.subscriptions.add(usersSub);
  }

  private loadRecentActivities(): void {
    // For now, we'll keep a minimal set of activities
    // In a real implementation, this would come from the backend
    this.recentActivities = [
      {
        id: 1,
        type: 'REQUEST',
        description: 'Yeni yardım talebi oluşturuldu',
        timestamp: new Date(Date.now() - 5 * 60 * 1000)
      },
      {
        id: 2,
        type: 'VOLUNTEER',
        description: 'Yeni gönüllü kaydı tamamlandı',
        timestamp: new Date(Date.now() - 15 * 60 * 1000)
      }
    ];
  }

  getActivityTypeLabel(type: string): string {
    const labels: { [key: string]: string } = {
      'REQUEST': 'Talep',
      'VOLUNTEER': 'Gönüllü',
      'BADGE': 'Rozet',
      'SAFEZONE': 'Güvenli Bölge'
    };
    return labels[type] || type;
  }
}
