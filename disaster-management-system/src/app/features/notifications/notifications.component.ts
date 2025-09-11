import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { WebSocketService, NotificationMessage } from '../../core/services/websocket.service';
import { NotificationService, NotificationHistory, NotificationPreferences } from '../../core/services/notification.service';
import { AuthService } from '../../core/services/auth.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100">
      <!-- Header -->
      <header class="bg-white shadow-sm border-b border-gray-200">
        <div class="container-responsive">
          <div class="flex flex-col sm:flex-row sm:justify-between sm:items-center py-4 sm:py-6 space-y-4 sm:space-y-0">
            <div>
              <h1 class="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900">Bildirimler & Duyurular</h1>
              <p class="text-gray-600 mt-1">Tüm bildirimlerinizi ve sistem duyurularını görüntüleyin ve yönetin</p>
            </div>
            <div class="flex items-center space-x-3">
              <!-- WebSocket Status -->
              <div class="flex items-center space-x-2">
                <div class="w-2 h-2 rounded-full" 
                     [ngClass]="isWebSocketConnected ? 'bg-green-500' : 'bg-red-500'"></div>
                <span class="text-sm text-gray-600">
                  {{ isWebSocketConnected ? 'Canlı' : 'Bağlantı Yok' }}
                </span>
              </div>
              
              @if (unreadCount > 0) {
                <button 
                  (click)="markAllAsRead()"
                  class="btn-primary text-sm px-4 py-2.5"
                >
                  <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Tümünü Okundu İşaretle
                </button>
              }
            </div>
          </div>
        </div>
      </header>

      <!-- Main Content -->
      <main class="container-responsive section-padding">
        <!-- Statistics Cards -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6">
          <div class="card p-4">
            <div class="flex items-center">
              <div class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-5 5v-5zM4.83 19.13a11.25 11.25 0 01-1.77-1.9A9 9 0 013 11a6 6 0 016-6c1.5 0 2.9.4 4.1 1.1a8.5 8.5 0 011.9-1.1A9 9 0 0121 11a9 9 0 01-1.06 6.23c-.3.6-.65 1.17-1.06 1.7a11.25 11.25 0 01-1.77 1.9A8.5 8.5 0 0115 21H9a8.5 8.5 0 01-4.17-1.87z" />
                </svg>
              </div>
              <div class="ml-4">
                <p class="text-sm font-medium text-gray-600">Toplam Bildirim</p>
                <p class="text-2xl font-bold text-gray-900">{{ notifications.length }}</p>
              </div>
            </div>
          </div>

          <div class="card p-4">
            <div class="flex items-center">
              <div class="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <svg class="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <div class="ml-4">
                <p class="text-sm font-medium text-gray-600">Okunmamış</p>
                <p class="text-2xl font-bold text-gray-900">{{ unreadCount }}</p>
              </div>
            </div>
          </div>

          <div class="card p-4">
            <div class="flex items-center">
              <div class="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div class="ml-4">
                <p class="text-sm font-medium text-gray-600">Okunmuş</p>
                <p class="text-2xl font-bold text-gray-900">{{ readCount }}</p>
              </div>
            </div>
          </div>

          <div class="card p-4">
            <div class="flex items-center">
              <div class="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <svg class="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-5 5v-5z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6-4h6m2 5H7a2 2 0 00-2 2v4a2 2 0 002 2h10a2 2 0 002-2v-4a2 2 0 00-2-2z" />
                </svg>
              </div>
              <div class="ml-4">
                <p class="text-sm font-medium text-gray-600">Sistem Duyuruları</p>
                <p class="text-2xl font-bold text-gray-900">{{ announcementsCount }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Tabs -->
        <div class="card p-4 sm:p-6 mb-6">
          <div class="flex border-b border-gray-200">
            <button 
              (click)="setActiveTab('notifications')"
              class="flex-1 px-4 py-2 text-sm font-medium text-center border-b-2 transition-colors"
              [class.text-primary-600]="activeTab === 'notifications'"
              [class.border-primary-600]="activeTab === 'notifications'"
              [class.text-gray-500]="activeTab !== 'notifications'"
              [class.border-transparent]="activeTab !== 'notifications'"
            >
              Bildirimler ({{ notifications.length }})
            </button>
            <button 
              (click)="setActiveTab('announcements')"
              class="flex-1 px-4 py-2 text-sm font-medium text-center border-b-2 transition-colors"
              [class.text-primary-600]="activeTab === 'announcements'"
              [class.border-primary-600]="activeTab === 'announcements'"
              [class.text-gray-500]="activeTab !== 'announcements'"
              [class.border-transparent]="activeTab !== 'announcements'"
            >
              Duyurular ({{ announcements.length }})
            </button>
          </div>
        </div>

        <!-- Filters -->
        <div class="card p-4 sm:p-6 mb-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">Filtreler</h3>
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div class="form-group">
              <label class="form-label">Tür</label>
              <select 
                [(ngModel)]="selectedType" 
                (change)="filterNotifications()"
                class="form-input"
              >
                <option value="">Tüm Türler</option>
                <option value="INFO">Bilgi</option>
                <option value="SUCCESS">Başarı</option>
                <option value="WARNING">Uyarı</option>
                <option value="EMERGENCY_ALERT">Acil Durum</option>
                <option value="ASSIGNMENT_UPDATE">Görev Güncellemesi</option>
                <option value="SYSTEM_ANNOUNCEMENT">Sistem Duyurusu</option>
              </select>
            </div>

            <div class="form-group">
              <label class="form-label">Durum</label>
              <select 
                [(ngModel)]="selectedStatus" 
                (change)="filterNotifications()"
                class="form-input"
              >
                <option value="">Tüm Durumlar</option>
                <option value="SENT">Okunmamış</option>
                <option value="READ">Okunmuş</option>
              </select>
            </div>

            <div class="form-group">
              <label class="form-label">Sıralama</label>
              <select 
                [(ngModel)]="sortBy" 
                (change)="sortNotifications()"
                class="form-input"
              >
                <option value="sentAt">Tarih</option>
                <option value="type">Tür</option>
                <option value="status">Durum</option>
              </select>
            </div>

            <div class="form-group">
              <label class="form-label">Arama</label>
              <input 
                type="text" 
                [(ngModel)]="searchTerm" 
                (input)="filterNotifications()"
                placeholder="Başlık veya mesaj ara..."
                class="form-input"
              >
            </div>
          </div>

          <!-- Active Filters Display -->
          @if (hasActiveFilters()) {
            <div class="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <div class="flex flex-wrap items-center gap-2">
                <span class="text-sm font-medium text-blue-800">Aktif Filtreler:</span>
                @if (selectedType) {
                  <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    Tür: {{ getTypeLabel(selectedType) }}
                    <button (click)="clearTypeFilter()" class="ml-1 text-blue-600 hover:text-blue-800">×</button>
                  </span>
                }
                @if (selectedStatus) {
                  <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Durum: {{ getStatusLabel(selectedStatus) }}
                    <button (click)="clearStatusFilter()" class="ml-1 text-green-600 hover:text-blue-800">×</button>
                  </span>
                }
                @if (searchTerm) {
                  <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                    Arama: "{{ searchTerm }}"
                    <button (click)="clearSearchFilter()" class="ml-1 text-yellow-600 hover:text-yellow-800">×</button>
                  </span>
                }
                <button 
                  (click)="clearFilters()"
                  class="text-sm text-blue-600 hover:text-blue-800 underline"
                >
                  Tümünü Temizle
                </button>
              </div>
            </div>
          }
        </div>

        <!-- Results Summary -->
        <div class="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6">
          <div class="mb-4 sm:mb-0">
            <p class="text-gray-600">
              <span class="font-semibold text-gray-900">{{ filteredNotifications.length }}</span> {{ activeTab === 'announcements' ? 'duyuru' : 'bildirim' }} bulundu
              @if (selectedType || selectedStatus || searchTerm) {
                <span class="text-sm text-gray-500">
                  (filtrelenmiş)
                </span>
              }
            </p>
          </div>
          
          <div class="flex items-center space-x-3">
            @if (selectedType || selectedStatus || searchTerm) {
              <button 
                (click)="clearFilters()"
                class="btn-secondary text-sm px-3 py-2"
              >
                Filtreleri Temizle
              </button>
            }
            
            @if (unreadCount > 0) {
              <button 
                (click)="markAllAsRead()"
                class="btn-primary text-sm px-3 py-2"
              >
                Tümünü Okundu İşaretle
              </button>
            }
          </div>
        </div>

        <!-- Notifications/Announcements List -->
        @if (filteredNotifications.length > 0) {
          <div class="space-y-4">
            @for (notification of filteredNotifications; track notification.id) {
              <div class="card p-6 hover:shadow-md transition-shadow"
                   [class.bg-blue-50]="notification.status === 'SENT'"
                   [class.border-l-4]="notification.status === 'SENT'"
                   [class.border-l-blue-500]="notification.status === 'SENT'">
                
                <!-- Notification Header -->
                <div class="flex items-start justify-between mb-4">
                  <div class="flex items-center space-x-3">
                    <div class="w-10 h-10 rounded-full flex items-center justify-center"
                         [ngClass]="{
                           'bg-blue-100': notification.type === 'INFO',
                           'bg-green-100': notification.type === 'SUCCESS',
                           'bg-yellow-100': notification.type === 'WARNING',
                           'bg-red-100': notification.type === 'EMERGENCY_ALERT',
                           'bg-purple-100': notification.type === 'ASSIGNMENT_UPDATE',
                           'bg-orange-100': notification.type === 'SYSTEM_ANNOUNCEMENT'
                         }">
                      <svg class="w-5 h-5" 
                           [ngClass]="{
                             'text-blue-600': notification.type === 'INFO',
                             'text-green-600': notification.type === 'SUCCESS',
                             'text-yellow-600': notification.type === 'WARNING',
                             'text-red-600': notification.type === 'EMERGENCY_ALERT',
                             'text-purple-600': notification.type === 'ASSIGNMENT_UPDATE',
                             'text-orange-600': notification.type === 'SYSTEM_ANNOUNCEMENT'
                           }"
                           fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        @switch (notification.type) {
                          @case ('INFO') {
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          }
                          @case ('SUCCESS') {
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          }
                          @case ('WARNING') {
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                          }
                          @case ('EMERGENCY_ALERT') {
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          }
                          @case ('ASSIGNMENT_UPDATE') {
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                          }
                          @case ('SYSTEM_ANNOUNCEMENT') {
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-5 5v-5z" />
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6-4h6m2 5H7a2 2 0 00-2 2v4a2 2 0 002 2h10a2 2 0 002-2v-4a2 2 0 00-2-2z" />
                          }
                        }
                      </svg>
                    </div>
                    <div>
                      <h3 class="font-semibold text-gray-900">{{ notification.title }}</h3>
                      <p class="text-sm text-gray-500">{{ notification.sentAt | date:'dd/MM/yyyy HH:mm' }}</p>
                    </div>
                  </div>
                  
                  <div class="flex items-center space-x-2">
                    @if (notification.status === 'SENT') {
                      <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        Yeni
                      </span>
                    }
                    
                    <span class="type-badge"
                          [ngClass]="{
                            'type-info': notification.type === 'INFO',
                            'type-success': notification.type === 'SUCCESS',
                            'type-warning': notification.type === 'WARNING',
                            'type-error': notification.type === 'EMERGENCY_ALERT',
                            'type-assignment': notification.type === 'ASSIGNMENT_UPDATE',
                            'type-announcement': notification.type === 'SYSTEM_ANNOUNCEMENT'
                          }">
                      {{ getTypeLabel(notification.type) }}
                    </span>
                  </div>
                </div>

                <!-- Notification Content -->
                <div class="mb-4">
                  <p class="text-gray-700 leading-relaxed">{{ notification.message }}</p>
                </div>

                <!-- Notification Footer -->
                <div class="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-3 sm:space-y-0">
                  <div class="text-sm text-gray-500">
                    <span class="font-medium">Gönderilme:</span> {{ getTimeAgo(notification.sentAt) }}
                    @if (notification.readAt) {
                      <span class="ml-4">
                        <span class="font-medium">Okunma:</span> {{ getTimeAgo(notification.readAt) }}
                      </span>
                    }
                  </div>
                  
                  <div class="flex space-x-2">
                    @if (notification.status === 'SENT') {
                      <button 
                        (click)="markAsRead(notification.id)"
                        class="btn-success text-sm px-3 py-2"
                      >
                        <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Okundu İşaretle
                      </button>
                    }
                    
                    <button 
                      (click)="deleteNotification(notification.id)"
                      class="btn-danger text-sm px-3 py-2"
                    >
                      <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      Sil
                    </button>
                  </div>
                </div>
              </div>
            }
          </div>
        }

        <!-- Empty State -->
        @if (filteredNotifications.length === 0) {
          <div class="text-center py-12">
            <div class="w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
              @if (activeTab === 'announcements') {
                <svg class="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-5 5v-5z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6-4h6m2 5H7a2 2 0 00-2 2v4a2 2 0 002 2h10a2 2 0 002-2v-4a2 2 0 00-2-2z" />
                </svg>
              } @else {
                <svg class="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-5 5v-5zM4.83 19.13a11.25 11.25 0 01-1.77-1.9A9 9 0 013 11a6 6 0 016-6c1.5 0 2.9.4 4.1 1.1a8.5 8.5 0 011.9-1.1A9 9 0 0121 11a9 9 0 01-1.06 6.23c-.3.6-.65 1.17-1.06 1.7a11.25 11.25 0 01-1.77 1.9A8.5 8.5 0 0115 21H9a8.5 8.5 0 01-4.17-1.87z" />
                </svg>
              }
            </div>
            <h3 class="text-lg font-medium text-gray-900 mb-2">
              {{ activeTab === 'announcements' ? 'Duyuru' : 'Bildirim' }} bulunamadı
            </h3>
            <p class="text-gray-600 mb-6">
              {{ selectedType || selectedStatus || searchTerm 
                 ? 'Seçilen filtrelere uygun ' + (activeTab === 'announcements' ? 'duyuru' : 'bildirim') + ' bulunamadı. Filtreleri değiştirmeyi deneyin.' 
                 : 'Henüz ' + (activeTab === 'announcements' ? 'duyuru' : 'bildirim') + ' yok.' }}
            </p>
          </div>
        }

        <!-- Loading State -->
        @if (isLoading) {
          <div class="text-center py-12">
            <div class="w-16 h-16 mx-auto mb-4 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
            <p class="text-gray-600">{{ activeTab === 'announcements' ? 'Duyurular' : 'Bildirimler' }} yükleniyor...</p>
          </div>
        }
      </main>
    </div>
  `,
  styles: [`
    .type-badge {
      @apply px-2 py-1 text-xs font-medium rounded-full;
    }
    
    .type-info {
      @apply bg-blue-100 text-blue-800;
    }
    
    .type-success {
      @apply bg-green-100 text-green-800;
    }
    
    .type-warning {
      @apply bg-yellow-100 text-yellow-800;
    }
    
    .type-error {
      @apply bg-red-100 text-red-800;
    }

    .type-assignment {
      @apply bg-purple-100 text-purple-800;
    }

    .type-announcement {
      @apply bg-orange-100 text-orange-800;
    }
  `]
})
export class NotificationsComponent implements OnInit, OnDestroy {
  notifications: NotificationHistory[] = [];
  announcements: NotificationHistory[] = [];
  filteredNotifications: NotificationHistory[] = [];
  isLoading = false;
  isWebSocketConnected = false;
  activeTab: 'notifications' | 'announcements' = 'notifications';
  
  // Filters
  selectedType: string = '';
  selectedStatus: string = '';
  searchTerm = '';
  
  // Sorting
  sortBy = 'sentAt';
  
  // Subscriptions
  private webSocketSubscriptions: Subscription[] = [];
  private notificationSubscriptions: Subscription[] = [];

  constructor(
    private webSocketService: WebSocketService,
    private notificationService: NotificationService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.setupWebSocket();
    this.setupNotificationService();
    this.loadNotifications();
  }

  ngOnDestroy(): void {
    this.webSocketSubscriptions.forEach(sub => sub.unsubscribe());
    this.notificationSubscriptions.forEach(sub => sub.unsubscribe());
  }

  setupWebSocket(): void {
    this.webSocketService.connect();
    
    const connectionSub = this.webSocketService.isConnected$.subscribe(
      connected => this.isWebSocketConnected = connected
    );
    
    const notificationSub = this.webSocketService.notifications$.subscribe(
      notification => this.handleNewNotification(notification)
    );
    
    this.webSocketSubscriptions.push(connectionSub, notificationSub);
  }

  setupNotificationService(): void {
    // Subscribe to notifications from the service
    const notificationsSub = this.notificationService.notifications$.subscribe(
      notifications => {
        this.notifications = notifications.filter(n => n.type !== 'SYSTEM_ANNOUNCEMENT');
        this.announcements = notifications.filter(n => n.type === 'SYSTEM_ANNOUNCEMENT');
        this.filterNotifications();
      }
    );
    
    this.notificationSubscriptions.push(notificationsSub);
  }

  loadNotifications(): void {
    this.isLoading = true;
    const currentUser = this.authService.getCurrentUser();
    
    if (currentUser && currentUser.id) {
      this.notificationService.getUserNotificationHistory(currentUser.id).subscribe(
        notifications => {
          this.notificationService.updateNotifications(notifications);
          this.isLoading = false;
        },
        error => {
          console.error('Error loading notifications:', error);
          this.isLoading = false;
        }
      );
    } else {
      this.isLoading = false;
    }
  }

  handleNewNotification(notification: NotificationMessage): void {
    // Convert WebSocket notification to NotificationHistory format
    const newNotification: NotificationHistory = {
      id: parseInt(notification.id),
      userId: notification.user_id || 0,
      title: notification.title,
      message: notification.message,
      type: this.mapNotificationType(notification.type),
      status: 'SENT',
      sentAt: notification.created_at,
      channel: 'WEBSOCKET'
    };
    
    this.notificationService.addNotification(newNotification);
  }

  mapNotificationType(type: string): string {
    const typeMap: { [key: string]: string } = {
      'info': 'INFO',
      'success': 'SUCCESS',
      'warning': 'WARNING',
      'error': 'EMERGENCY_ALERT'
    };
    return typeMap[type] || 'INFO';
  }

  setActiveTab(tab: 'notifications' | 'announcements'): void {
    this.activeTab = tab;
    this.filterNotifications();
  }

  filterNotifications(): void {
    const sourceNotifications = this.activeTab === 'announcements' ? this.announcements : this.notifications;
    
    this.filteredNotifications = sourceNotifications.filter(notification => {
      const typeMatch = !this.selectedType || notification.type === this.selectedType;
      
      const statusMatch = !this.selectedStatus || 
        (this.selectedStatus === 'READ' && notification.status === 'READ') ||
        (this.selectedStatus === 'SENT' && notification.status === 'SENT');
      
      const searchMatch = !this.searchTerm || 
        notification.title.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        notification.message.toLowerCase().includes(this.searchTerm.toLowerCase());
      
      return typeMatch && statusMatch && searchMatch;
    });
    
    this.sortNotifications();
  }

  sortNotifications(): void {
    if (!this.filteredNotifications || this.filteredNotifications.length === 0) return;
    
    this.filteredNotifications.sort((a, b) => {
      switch (this.sortBy) {
        case 'sentAt':
          return new Date(b.sentAt).getTime() - new Date(a.sentAt).getTime();
        
        case 'type':
          return a.type.localeCompare(b.type);
        
        case 'status':
          return a.status.localeCompare(b.status);
        
        default:
          return 0;
      }
    });
  }

  clearFilters(): void {
    this.selectedType = '';
    this.selectedStatus = '';
    this.searchTerm = '';
    this.filterNotifications();
  }

  clearTypeFilter(): void {
    this.selectedType = '';
    this.filterNotifications();
  }

  clearStatusFilter(): void {
    this.selectedStatus = '';
    this.filterNotifications();
  }

  clearSearchFilter(): void {
    this.searchTerm = '';
    this.filterNotifications();
  }

  hasActiveFilters(): boolean {
    return !!(this.selectedType || this.selectedStatus || this.searchTerm);
  }

  markAsRead(notificationId: number): void {
    const currentUser = this.authService.getCurrentUser();
    if (currentUser && currentUser.id) {
      this.notificationService.markNotificationAsRead(notificationId).subscribe(() => {
        this.notificationService.markAsReadLocally(notificationId);
      });
    }
  }

  markAllAsRead(): void {
    const currentUser = this.authService.getCurrentUser();
    if (currentUser && currentUser.id) {
      this.notificationService.markAllNotificationsAsRead(currentUser.id).subscribe(() => {
        this.notificationService.markAllAsReadLocally();
      });
    }
  }

  deleteNotification(notificationId: number): void {
    const index = this.notifications.findIndex(n => n.id === notificationId);
    if (index !== -1) {
      this.notifications.splice(index, 1);
      this.filterNotifications();
    }
  }

  get unreadCount(): number {
    return this.notificationService.getUnreadCount();
  }

  get readCount(): number {
    const allNotifications = [...this.notifications, ...this.announcements];
    return allNotifications.filter(n => n.status === 'READ').length;
  }

  get announcementsCount(): number {
    return this.announcements.length;
  }

  getTypeLabel(type: string): string {
    const labels: { [key: string]: string } = {
      'INFO': 'Bilgi',
      'SUCCESS': 'Başarı',
      'WARNING': 'Uyarı',
      'EMERGENCY_ALERT': 'Acil Durum',
      'ASSIGNMENT_UPDATE': 'Görev Güncellemesi',
      'SYSTEM_ANNOUNCEMENT': 'Sistem Duyurusu'
    };
    return labels[type] || type;
  }

  getStatusLabel(status: string): string {
    const labels: { [key: string]: string } = {
      'READ': 'Okunmuş',
      'SENT': 'Okunmamış'
    };
    return labels[status] || status;
  }

  getTimeAgo(date: Date): string {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) {
      return 'Az önce';
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes} dakika önce`;
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours} saat önce`;
    } else {
      const days = Math.floor(diffInSeconds / 86400);
      return `${days} gün önce`;
    }
  }
}
