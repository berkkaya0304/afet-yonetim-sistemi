import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

// Notification interfaces based on backend DTOs
export interface NotificationEvent {
  userId: number;
  title: string;
  message: string;
}

export interface NotificationHistory {
  id: number;
  userId: number;
  title: string;
  message: string;
  type: string;
  status: 'SENT' | 'READ' | 'FAILED';
  sentAt: Date;
  readAt?: Date;
  channel: 'PUSH' | 'EMAIL' | 'SMS' | 'WEBSOCKET';
}

export interface NotificationPreferences {
  userId: number;
  pushEnabled: boolean;
  emailEnabled: boolean;
  smsEnabled: boolean;
  emergencyAlertsEnabled: boolean;
  assignmentUpdatesEnabled: boolean;
  systemAnnouncementsEnabled: boolean;
}

// Frontend notification interface
export interface Notification {
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  duration?: number;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private readonly baseUrl = `/api/v1/notifications`;
  
  // Frontend notifications
  private notificationSubject = new BehaviorSubject<Notification | null>(null);
  public notification$ = this.notificationSubject.asObservable();
  
  // Backend notifications
  private notificationsSubject = new BehaviorSubject<NotificationHistory[]>([]);
  public notifications$ = this.notificationsSubject.asObservable();
  
  // Preferences
  private preferencesSubject = new BehaviorSubject<NotificationPreferences | null>(null);
  public preferences$ = this.preferencesSubject.asObservable();

  constructor(private http: HttpClient) {
    console.log('NotificationService: Constructor called');
    console.log('NotificationService: Base URL:', this.baseUrl);
  }

  // ===== FRONTEND NOTIFICATIONS =====
  showSuccess(message: string, duration: number = 5000): void {
    this.showNotification({ message, type: 'success', duration });
  }

  showError(message: string, duration: number = 5000): void {
    this.showNotification({ message, type: 'error', duration });
  }

  showInfo(message: string, duration: number = 5000): void {
    this.showNotification({ message, type: 'info', duration });
  }

  showWarning(message: string, duration: number = 5000): void {
    this.showNotification({ message, type: 'warning', duration });
  }

  clear(): void {
    this.notificationSubject.next(null);
  }

  private showNotification(notification: Notification): void {
    this.notificationSubject.next(notification);
    
    if (notification.duration) {
      setTimeout(() => {
        this.clear();
      }, notification.duration);
    }
  }

  // ===== BACKEND NOTIFICATIONS =====
  
  // Get user notification preferences
  getUserPreferences(userId: number): Observable<NotificationPreferences> {
    return this.http.get<NotificationPreferences>(`${this.baseUrl}/preferences/${userId}`);
  }

  // Update user notification preferences
  updateUserPreferences(userId: number, preferences: NotificationPreferences): Observable<NotificationPreferences> {
    return this.http.put<NotificationPreferences>(`${this.baseUrl}/preferences/${userId}`, preferences);
  }

  // Get user notification history
  getUserNotificationHistory(userId: number, page: number = 0, size: number = 20): Observable<NotificationHistory[]> {
    console.log('=== NotificationService.getUserNotificationHistory ===');
    console.log('User ID:', userId);
    console.log('Page:', page);
    console.log('Size:', size);
    console.log('Full URL:', `${this.baseUrl}/history/${userId}`);
    console.log('==================================================');
    
    return this.http.get<NotificationHistory[]>(`${this.baseUrl}/history/${userId}`, {
      params: { page: page.toString(), size: size.toString() }
    });
  }

  // Mark notification as read
  markNotificationAsRead(notificationId: number): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/mark-read/${notificationId}`, {});
  }

  // Mark all notifications as read
  markAllNotificationsAsRead(userId: number): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/mark-all-read/${userId}`, {});
  }

  // Clear notification history
  clearNotificationHistory(userId: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/history/${userId}`);
  }

  // ===== ANNOUNCEMENTS FUNCTIONALITY =====
  
  // Send system announcement (admin function)
  sendSystemAnnouncement(announcement: {
    title: string;
    message: string;
    targetUsers?: number[]; // If empty, sends to all users
    type?: 'INFO' | 'WARNING' | 'EMERGENCY';
  }): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/announcements`, announcement);
  }

  // Get system announcements
  getSystemAnnouncements(userId: number): Observable<NotificationHistory[]> {
    return this.http.get<NotificationHistory[]>(`${this.baseUrl}/announcements/${userId}`);
  }

  // ===== LOCAL STATE MANAGEMENT =====
  
  // Update local notifications
  updateNotifications(notifications: NotificationHistory[]): void {
    console.log('=== NotificationService.updateNotifications ===');
    console.log('Input notifications:', notifications);
    console.log('Current notifications count:', this.notificationsSubject.value.length);
    console.log('=============================================');
    
    this.notificationsSubject.next(notifications);
    console.log('✅ Notifications updated successfully');
    console.log('New notifications count:', this.notificationsSubject.value.length);
  }

  // Add new notification
  addNotification(notification: NotificationHistory): void {
    const current = this.notificationsSubject.value;
    this.notificationsSubject.next([notification, ...current]);
  }

  // Mark notification as read locally
  markAsReadLocally(notificationId: number): void {
    const current = this.notificationsSubject.value;
    const updated = current.map(n => 
      n.id === notificationId ? { ...n, status: 'READ' as const, readAt: new Date() } : n
    );
    this.notificationsSubject.next(updated);
  }

  // Mark all as read locally
  markAllAsReadLocally(): void {
    const current = this.notificationsSubject.value;
    const updated = current.map(n => ({ ...n, status: 'READ' as const, readAt: new Date() }));
    this.notificationsSubject.next(updated);
  }

  // Get current notifications
  getCurrentNotifications(): NotificationHistory[] {
    return this.notificationsSubject.value;
  }

  // Get current preferences
  getCurrentPreferences(): NotificationPreferences | null {
    return this.preferencesSubject.value;
  }

  // Update preferences locally
  updatePreferencesLocally(preferences: NotificationPreferences): void {
    this.preferencesSubject.next(preferences);
  }

  // ===== UTILITY METHODS =====
  
  // Check if user has unread notifications
  hasUnreadNotifications(): boolean {
    const notifications = this.getCurrentNotifications();
    return notifications.some(n => n.status === 'SENT');
  }

  // Get unread count
  getUnreadCount(): number {
    const notifications = this.getCurrentNotifications();
    return notifications.filter(n => n.status === 'SENT').length;
  }

  // Get notifications by type
  getNotificationsByType(type: string): NotificationHistory[] {
    const notifications = this.getCurrentNotifications();
    return notifications.filter(n => n.type === type);
  }

  // Get system announcements
  getSystemAnnouncementsLocal(): NotificationHistory[] {
    const notifications = this.getCurrentNotifications();
    return notifications.filter(n => n.type === 'SYSTEM_ANNOUNCEMENT');
  }

  // Get emergency alerts
  getEmergencyAlerts(): NotificationHistory[] {
    const notifications = this.getCurrentNotifications();
    return notifications.filter(n => n.type === 'EMERGENCY_ALERT');
  }

  // Get assignment updates
  getAssignmentUpdates(): NotificationHistory[] {
    const notifications = this.getCurrentNotifications();
    return notifications.filter(n => n.type === 'ASSIGNMENT_UPDATE');
  }

  // Create sample system announcement for testing
  createSampleSystemAnnouncement(): void {
    const sampleAnnouncement: NotificationHistory = {
      id: Date.now(),
      userId: 1, // System user
      title: 'Sistem Bakım Duyurusu',
      message: 'Sistem bakımı nedeniyle 15 dakika boyunca hizmet verilemeyecektir. Lütfen işlemlerinizi tamamlayın.',
      type: 'SYSTEM_ANNOUNCEMENT',
      status: 'SENT',
      sentAt: new Date(),
      channel: 'WEBSOCKET'
    };

    console.log('Creating sample system announcement:', sampleAnnouncement);
    this.addNotification(sampleAnnouncement);
  }
}
