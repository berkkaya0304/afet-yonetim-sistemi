import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { WebSocketService, NotificationMessage } from '../../core/services/websocket.service';
import { NotificationService, NotificationHistory, NotificationPreferences } from '../../core/services/notification.service';
import { AuthService } from '../../core/services/auth.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-notification',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="relative">
      <!-- Notification Bell -->
      <button 
        (click)="toggleNotifications()"
        class="relative p-2 text-gray-600 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500 rounded-lg transition-colors"
        [class.text-primary-600]="hasUnreadNotifications"
      >
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 8a6 6 0 0112 0c0 7-3 9-3 9H3s3-2-3-9z" />
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.5 19c0 1.5 1.5 3 3.5 3s3.5-1.5 3.5-3" />
        </svg>
        
        <!-- Notification Badge -->
        @if (unreadCount > 0) {
          <span class="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
            {{ unreadCount > 99 ? '99+' : unreadCount }}
          </span>
        }
      </button>

      <!-- Notifications Dropdown -->
      @if (isOpen) {
        <div class="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-200 z-50">
          <!-- Header -->
          <div class="flex items-center justify-between p-4 border-b border-gray-200">
            <h3 class="text-lg font-semibold text-gray-900">Bildirimler</h3>
            <div class="flex items-center space-x-2">
              @if (unreadCount > 0) {
                <button 
                  (click)="markAllAsRead()"
                  class="text-sm text-primary-600 hover:text-primary-800 font-medium"
                >
                  Tümünü Okundu İşaretle
                </button>
              }
              <button 
                (click)="closeNotifications()"
                class="text-gray-400 hover:text-gray-600"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          <!-- Tabs -->
          <div class="flex border-b border-gray-200">
            <button 
              (click)="setActiveTab('notifications')"
              class="flex-1 px-4 py-2 text-sm font-medium text-center border-b-2 transition-colors"
              [class.text-primary-600]="activeTab === 'notifications'"
              [class.border-primary-600]="activeTab === 'notifications'"
              [class.text-gray-500]="activeTab !== 'notifications'"
              [class.border-transparent]="activeTab !== 'notifications'"
            >
              Bildirimler
            </button>
            <button 
              (click)="setActiveTab('announcements')"
              class="flex-1 px-4 py-2 text-sm font-medium text-center border-b-2 transition-colors"
              [class.text-primary-600]="activeTab === 'announcements'"
              [class.border-primary-600]="activeTab === 'announcements'"
              [class.text-gray-500]="activeTab !== 'announcements'"
              [class.border-transparent]="activeTab !== 'announcements'"
            >
              Duyurular
            </button>
          </div>

          <!-- Notifications Tab -->
          @if (activeTab === 'notifications') {
            <div class="max-h-96 overflow-y-auto">
              @if (notifications.length > 0) {
                @for (notification of notifications; track notification.id) {
                  <div class="p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer"
                       [class.bg-blue-50]="notification.status === 'SENT'"
                       (click)="markAsRead(notification.id)">
                    
                    <!-- Notification Content -->
                    <div class="flex items-start space-x-3">
                      <!-- Icon -->
                      <div class="flex-shrink-0">
                        <div class="w-8 h-8 rounded-full flex items-center justify-center"
                             [ngClass]="{
                               'bg-blue-100': notification.type === 'INFO',
                               'bg-green-100': notification.type === 'SUCCESS',
                               'bg-yellow-100': notification.type === 'WARNING',
                               'bg-red-100': notification.type === 'EMERGENCY_ALERT',
                               'bg-purple-100': notification.type === 'ASSIGNMENT_UPDATE',
                               'bg-orange-100': notification.type === 'SYSTEM_ANNOUNCEMENT'
                             }">
                          <svg class="w-4 h-4" 
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
                              @default {
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 8a6 6 0 0112 0c0 7-3 9-3 9H3s3-2-3-9z" />
                              }
                            }
                          </svg>
                        </div>
                      </div>

                      <!-- Content -->
                      <div class="flex-1 min-w-0">
                        <div class="flex items-start justify-between">
                          <p class="text-sm font-medium text-gray-900 line-clamp-2">
                            {{ notification.title }}
                          </p>
                          <span class="text-xs text-gray-500 ml-2">
                            {{ getTimeAgo(notification.sentAt) }}
                          </span>
                        </div>
                        <p class="text-sm text-gray-600 mt-1 line-clamp-2">
                          {{ notification.message }}
                        </p>
                        
                        <!-- Unread Indicator -->
                        @if (notification.status === 'SENT') {
                          <div class="mt-2">
                            <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              Yeni
                            </span>
                          </div>
                        }
                      </div>
                    </div>
                  </div>
                }
              } @else {
                <!-- Empty State -->
                <div class="p-8 text-center">
                  <svg class="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 8a6 6 0 0112 0c0 7-3 9-3 9H3s3-2-3-9z" />
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.5 19c0 1.5 1.5 3 3.5 3s3.5-1.5 3.5-3" />
                  </svg>
                  <p class="text-gray-500">Henüz bildirim yok</p>
                  <p class="text-sm text-gray-400 mt-1">Yeni bildirimler burada görünecek</p>
                  <p class="text-xs text-gray-400 mt-2">Debug: {{ notifications.length }} bildirim yüklendi</p>
                </div>
              }
            </div>
          }

          <!-- Announcements Tab -->
          @if (activeTab === 'announcements') {
            <div class="max-h-96 overflow-y-auto">
              @if (announcements.length > 0) {
                @for (announcement of announcements; track announcement.id) {
                  <div class="p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer"
                       [class.bg-orange-50]="announcement.status === 'SENT'"
                       (click)="markAsRead(announcement.id)">
                    
                    <!-- Announcement Content -->
                    <div class="flex items-start space-x-3">
                      <!-- Icon -->
                      <div class="flex-shrink-0">
                        <div class="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                          <svg class="w-4 h-4 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-5 5v-5z" />
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6-4h6m2 5H7a2 2 0 00-2 2v4a2 2 0 002 2h10a2 2 0 002-2v-4a2 2 0 00-2-2z" />
                          </svg>
                        </div>
                      </div>

                      <!-- Content -->
                      <div class="flex-1 min-w-0">
                        <div class="flex items-start justify-between">
                          <p class="text-sm font-medium text-gray-900 line-clamp-2">
                            {{ announcement.title }}
                          </p>
                          <span class="text-xs text-gray-500 ml-2">
                            {{ getTimeAgo(announcement.sentAt) }}
                          </span>
                        </div>
                        <p class="text-sm text-gray-600 mt-1 line-clamp-2">
                          {{ announcement.message }}
                        </p>
                        
                        <!-- Unread Indicator -->
                        @if (announcement.status === 'SENT') {
                          <div class="mt-2">
                            <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                              Yeni Duyuru
                            </span>
                          </div>
                        }
                      </div>
                    </div>
                  </div>
                }
              } @else {
                <!-- Empty State -->
                <div class="p-8 text-center">
                  <svg class="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-5 5v-5z" />
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6-4h6m2 5H7a2 2 0 00-2 2v4a2 2 0 002 2h10a2 2 0 002-2v-4a2 2 0 00-2-2z" />
                  </svg>
                  <p class="text-gray-500">Henüz duyuru yok</p>
                  <p class="text-sm text-gray-400 mt-1">Sistem duyuruları burada görünecek</p>
                </div>
              }
            </div>
          }

          <!-- Footer -->
          @if (notifications.length > 0 || announcements.length > 0) {
            <div class="p-4 border-t border-gray-200 bg-gray-50 rounded-b-lg">
              <div class="flex items-center justify-between">
                <span class="text-sm text-gray-600">
                  {{ unreadCount }} okunmamış {{ activeTab === 'announcements' ? 'duyuru' : 'bildirim' }}
                </span>
                <button 
                  routerLink="/notifications"
                  class="text-sm text-primary-600 hover:text-primary-800 font-medium"
                >
                  Tümünü Gör
                </button>
              </div>
            </div>
          } @else {
            <!-- Debug section when no notifications -->
            <div class="p-4 border-t border-gray-200 bg-gray-50 rounded-b-lg">
              <div class="flex items-center justify-between">
                <span class="text-sm text-gray-600">
                  Debug: {{ notifications.length }} bildirim, {{ announcements.length }} duyuru
                </span>
                <div class="flex space-x-2">
                  <button 
                    (click)="loadNotifications()"
                    class="text-sm text-primary-600 hover:text-primary-800 font-medium"
                  >
                    Yenile
                  </button>
                  <button 
                    (click)="sendTestNotification()"
                    class="text-sm text-green-600 hover:text-green-800 font-medium"
                  >
                    Test Bildirimi
                  </button>
                  <button 
                    (click)="showAddAnnouncementModal()"
                    class="text-sm text-blue-600 hover:text-blue-800 font-medium"
                  >
                    Sistem Duyurusu Ekle
                  </button>
                  <button 
                    (click)="createSampleAnnouncement()"
                    class="text-sm text-purple-600 hover:text-purple-800 font-medium"
                  >
                    Örnek Duyuru
                  </button>
                </div>
              </div>
            </div>
          }
        </div>
      }

      <!-- Backdrop -->
      @if (isOpen) {
        <div 
          class="fixed inset-0 z-40"
          (click)="closeNotifications()"
        ></div>
      }

      <!-- Add Announcement Modal -->
      @if (isAddAnnouncementModalOpen) {
        <div class="fixed inset-0 z-50 flex items-center justify-center">
          <!-- Modal Backdrop -->
          <div 
            class="absolute inset-0 bg-black bg-opacity-50"
            (click)="closeAddAnnouncementModal()"
          ></div>
          
          <!-- Modal Content -->
          <div class="relative bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
            <!-- Header -->
            <div class="flex items-center justify-between p-4 border-b border-gray-200">
              <h3 class="text-lg font-semibold text-gray-900">Sistem Duyurusu Ekle</h3>
              <button 
                (click)="closeAddAnnouncementModal()"
                class="text-gray-400 hover:text-gray-600"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <!-- Form -->
            <form (ngSubmit)="createAnnouncement()" class="p-4 space-y-4">
              <!-- Title -->
              <div>
                <label for="announcementTitle" class="block text-sm font-medium text-gray-700 mb-1">
                  Başlık
                </label>
                <input
                  type="text"
                  id="announcementTitle"
                  [(ngModel)]="newAnnouncement.title"
                  name="title"
                  required
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Duyuru başlığı"
                />
              </div>
              
              <!-- Message -->
              <div>
                <label for="announcementMessage" class="block text-sm font-medium text-gray-700 mb-1">
                  Mesaj
                </label>
                <textarea
                  id="announcementMessage"
                  [(ngModel)]="newAnnouncement.message"
                  name="message"
                  required
                  rows="3"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Duyuru mesajı"
                ></textarea>
              </div>
              
              <!-- Type -->
              <div>
                <label for="announcementType" class="block text-sm font-medium text-gray-700 mb-1">
                  Tip
                </label>
                <select
                  id="announcementType"
                  [(ngModel)]="newAnnouncement.type"
                  name="type"
                  required
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="INFO">Bilgi</option>
                  <option value="WARNING">Uyarı</option>
                  <option value="EMERGENCY">Acil Durum</option>
                </select>
              </div>
              
              <!-- Buttons -->
              <div class="flex space-x-3 pt-4">
                <button
                  type="button"
                  (click)="closeAddAnnouncementModal()"
                  class="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  [disabled]="!newAnnouncement.title || !newAnnouncement.message"
                  class="flex-1 px-4 py-2 text-sm font-medium text-white bg-primary-600 border border-transparent rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Duyuru Ekle
                </button>
              </div>
            </form>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .line-clamp-2 {
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
  `]
})
export class NotificationComponent implements OnInit, OnDestroy {
  notifications: NotificationHistory[] = [];
  announcements: NotificationHistory[] = [];
  isOpen = false;
  activeTab: 'notifications' | 'announcements' = 'notifications';
  
  // Announcement modal properties
  isAddAnnouncementModalOpen = false;
  newAnnouncement = {
    title: '',
    message: '',
    type: 'INFO' as 'INFO' | 'WARNING' | 'EMERGENCY'
  };
  
  private webSocketSubscriptions: Subscription[] = [];
  private notificationSubscriptions: Subscription[] = [];

  constructor(
    private webSocketService: WebSocketService,
    private notificationService: NotificationService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Set up WebSocket connection
    this.setupWebSocket();
    
    // Set up notification service
    this.setupNotificationService();
    
    // Subscribe to auth service user updates
    this.authService.currentUser$.subscribe(user => {
      if (user) {
        this.loadNotifications();
      }
    });
  }

  ngOnDestroy(): void {
    this.webSocketSubscriptions.forEach(sub => sub.unsubscribe());
    this.notificationSubscriptions.forEach(sub => sub.unsubscribe());
  }

  private setupWebSocket(): void {
    // Subscribe to WebSocket connection status
    this.webSocketService.isConnected$.subscribe(isConnected => {
      if (isConnected) {
        // WebSocket connected successfully
      } else {
        // WebSocket disconnected
      }
    });

    // Subscribe to WebSocket notifications
    this.webSocketService.notifications$.subscribe(notification => {
      this.handleNewNotification(notification);
    });

    // WebSocket setup completed
  }

  private setupNotificationService(): void {
    // Subscribe to notifications from service
    this.notificationService.notifications$.subscribe(notifications => {
      this.notifications = notifications.filter(n => n.userId === this.authService.getCurrentUser()?.id);
      this.announcements = this.notifications.filter(n => n.type === 'SYSTEM_ANNOUNCEMENT');
    });
  }

  public loadNotifications(): void {
    const currentUser = this.authService.getCurrentUser();
    const isAuthenticated = this.authService.isAuthenticated();
    const token = this.authService.getToken();

    if (currentUser && isAuthenticated && token) {
      // User found, loading from API...
      this.notificationService.getUserNotificationHistory(currentUser.id).subscribe({
        next: (notifications) => {
          this.notificationService.updateNotifications(notifications);
        },
        error: (error) => {
          if (error.status === 401) {
            // Handle unauthorized error
            this.notifications = [];
            this.announcements = [];
          } else {
            // Handle other errors
            this.notifications = [];
            this.announcements = [];
          }
        }
      });
    } else {
      // No current user found, loading sample notifications
      this.loadSampleNotifications();
    }
  }

  private loadSampleNotifications(): void {
    // Loading sample notifications
    const sampleNotifications: NotificationHistory[] = [
      {
        id: 1,
        userId: 1,
        title: 'Hoş Geldiniz!',
        message: 'Afet Yönetim Sistemine hoş geldiniz. Sistem aktif ve çalışır durumda.',
        type: 'INFO',
        status: 'SENT',
        sentAt: new Date(),
        channel: 'WEBSOCKET'
      },
      {
        id: 2,
        userId: 1,
        title: 'Güvenlik Güncellemesi',
        message: 'Sistem güvenlik güncellemesi yapıldı. Lütfen şifrenizi güncelleyin.',
        type: 'WARNING',
        status: 'READ',
        sentAt: new Date(Date.now() - 86400000), // 1 gün önce
        channel: 'WEBSOCKET'
      },
      {
        id: 3,
        userId: 1,
        title: 'Yeni Özellik',
        message: 'Harita görünümünde yeni özellikler eklendi. Keşfetmek için haritayı açın.',
        type: 'SUCCESS',
        status: 'SENT',
        sentAt: new Date(Date.now() - 172800000), // 2 gün önce
        channel: 'WEBSOCKET'
      }
    ];

    this.notifications = sampleNotifications;
    this.announcements = sampleNotifications.filter(n => n.type === 'SYSTEM_ANNOUNCEMENT');
  }

  handleNewNotification(notification: NotificationMessage): void {
    // Convert WebSocket notification to NotificationHistory format
    const newNotification: NotificationHistory = {
      id: parseInt(notification.id),
      userId: notification.user_id || 0, // Default to 0 if user_id is undefined
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
  }

  toggleNotifications(): void {
    this.isOpen = !this.isOpen;
  }

  closeNotifications(): void {
    this.isOpen = false;
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

  get unreadCount(): number {
    const count = this.notificationService.getUnreadCount();
    return count;
  }

  get hasUnreadNotifications(): boolean {
    const hasUnread = this.notificationService.hasUnreadNotifications();
    return hasUnread;
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

  sendTestNotification(): void {
    const testNotification: NotificationHistory = {
      id: Date.now(), // Use timestamp as unique ID
      userId: 1,
      title: 'Test Bildirimi',
      message: 'Bu bir test bildirimidir. Bildirim sistemi çalışıyor!',
      type: 'INFO',
      status: 'SENT',
      sentAt: new Date(),
      channel: 'WEBSOCKET'
    };
    
    this.notificationService.addNotification(testNotification);
  }

  showAddAnnouncementModal(): void {
    this.isAddAnnouncementModalOpen = true;
    this.resetNewAnnouncement();
  }

  closeAddAnnouncementModal(): void {
    this.isAddAnnouncementModalOpen = false;
    this.resetNewAnnouncement();
  }

  createAnnouncement(): void {
    if (!this.newAnnouncement.title || !this.newAnnouncement.message) {
      return;
    }

    const announcement: NotificationHistory = {
      id: Date.now(),
      userId: 1, // System user ID
      title: this.newAnnouncement.title,
      message: this.newAnnouncement.message,
      type: this.newAnnouncement.type,
      status: 'SENT',
      sentAt: new Date(),
      channel: 'WEBSOCKET'
    };

    // Add to local state
    this.notificationService.addNotification(announcement);
    
    // Close modal and reset form
    this.closeAddAnnouncementModal();
  }

  private resetNewAnnouncement(): void {
    this.newAnnouncement = {
      title: '',
      message: '',
      type: 'INFO'
    };
  }

  createSampleAnnouncement(): void {
    const sampleAnnouncement: NotificationHistory = {
      id: Date.now(),
      userId: 1, // System user ID
      title: 'Örnek Sistem Duyurusu',
      message: 'Bu bir örnek sistem duyurusudur. Sistem duyurularını test etmek için kullanılabilir.',
      type: 'SYSTEM_ANNOUNCEMENT',
      status: 'SENT',
      sentAt: new Date(),
      channel: 'WEBSOCKET'
    };
    this.notificationService.addNotification(sampleAnnouncement);
  }
}
