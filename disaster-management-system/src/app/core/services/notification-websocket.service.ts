import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { WebSocketService, NotificationMessage, EmergencyAlertEvent } from './websocket.service';

export interface NotificationEvent {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  created_at: Date;
  user_id?: number;
  category?: 'SYSTEM' | 'EMERGENCY' | 'ASSIGNMENT' | 'HELP_REQUEST' | 'SAFE_ZONE';
  priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  action_required?: boolean;
  expires_at?: Date;
}

export interface NotificationCount {
  total: number;
  unread: number;
  byType: {
    info: number;
    success: number;
    warning: number;
    error: number;
  };
  byCategory: {
    SYSTEM: number;
    EMERGENCY: number;
    ASSIGNMENT: number;
    HELP_REQUEST: number;
    SAFE_ZONE: number;
  };
}

@Injectable({
  providedIn: 'root'
})
export class NotificationWebSocketService {
  private notificationsSubject = new BehaviorSubject<NotificationEvent[]>([]);
  private unreadCountSubject = new BehaviorSubject<number>(0);
  private notificationCountSubject = new BehaviorSubject<NotificationCount>({
    total: 0,
    unread: 0,
    byType: { info: 0, success: 0, warning: 0, error: 0 },
    byCategory: { SYSTEM: 0, EMERGENCY: 0, ASSIGNMENT: 0, HELP_REQUEST: 0, SAFE_ZONE: 0 }
  });
  private newNotificationSubject = new Subject<NotificationEvent>();
  private emergencyAlertSubject = new Subject<EmergencyAlertEvent>();
  
  public notifications$ = this.notificationsSubject.asObservable();
  public unreadCount$ = this.unreadCountSubject.asObservable();
  public notificationCount$ = this.notificationCountSubject.asObservable();
  public newNotification$ = this.newNotificationSubject.asObservable();
  public emergencyAlerts$ = this.emergencyAlertSubject.asObservable();

  private notifications: NotificationEvent[] = [];
  private maxNotifications = 100; // Maksimum saklanacak bildirim sayısı

  constructor(private webSocketService: WebSocketService) {
    this.initializeWebSocketSubscriptions();
  }

  private initializeWebSocketSubscriptions(): void {
    // Genel bildirimleri dinle
    this.webSocketService.notifications$.subscribe((notification: NotificationMessage) => {
      this.handleNotification(notification);
    });

    // Acil durum uyarılarını dinle
    this.webSocketService.emergencyAlerts$.subscribe((alert: EmergencyAlertEvent) => {
      this.handleEmergencyAlert(alert);
    });
  }

  private handleNotification(notification: NotificationMessage): void {
    const notificationEvent: NotificationEvent = {
      ...notification,
      category: this.determineCategory(notification),
      priority: this.determinePriority(notification),
      action_required: this.isActionRequired(notification),
      expires_at: this.calculateExpiry(notification)
    };

    // Yeni bildirimi ekle
    this.addNotification(notificationEvent);
    
    // Yeni bildirim event'ini yayınla
    this.newNotificationSubject.next(notificationEvent);
    
    // Bildirim sayılarını güncelle
    this.updateNotificationCounts();
  }

  private handleEmergencyAlert(alert: EmergencyAlertEvent): void {
    this.emergencyAlertSubject.next(alert);
    
    // Emergency alert'i notification olarak da ekle
    const notificationEvent: NotificationEvent = {
      id: alert.alertId.toString(),
      title: alert.title,
      message: alert.message,
      type: this.getNotificationType(alert.severity),
      read: false,
      created_at: new Date(alert.timestamp),
      category: 'EMERGENCY',
      priority: alert.severity as any,
      action_required: true,
      expires_at: new Date(alert.timestamp + 24 * 60 * 60 * 1000) // 24 saat sonra
    };
    
    this.addNotification(notificationEvent);
    this.newNotificationSubject.next(notificationEvent);
    this.updateNotificationCounts();
  }

  private addNotification(notification: NotificationEvent): void {
    // Maksimum bildirim sayısını aşmamak için eski bildirimleri temizle
    if (this.notifications.length >= this.maxNotifications) {
      this.notifications = this.notifications.slice(-this.maxNotifications + 1);
    }
    
    // Yeni bildirimi başa ekle
    this.notifications.unshift(notification);
    this.notificationsSubject.next([...this.notifications]);
  }

  private determineCategory(notification: NotificationMessage): NotificationEvent['category'] {
    // Mesaj içeriğine göre kategori belirle
    const message = notification.message.toLowerCase();
    const title = notification.title.toLowerCase();
    
    if (message.includes('emergency') || message.includes('acil') || title.includes('emergency')) {
      return 'EMERGENCY';
    }
    if (message.includes('assignment') || message.includes('görev') || title.includes('assignment')) {
      return 'ASSIGNMENT';
    }
    if (message.includes('help') || message.includes('yardım') || title.includes('help')) {
      return 'HELP_REQUEST';
    }
    if (message.includes('safe') || message.includes('güvenli') || title.includes('safe')) {
      return 'SAFE_ZONE';
    }
    
    return 'SYSTEM';
  }

  private determinePriority(notification: NotificationMessage): NotificationEvent['priority'] {
    // Mesaj türüne göre öncelik belirle
    switch (notification.type) {
      case 'error':
        return 'CRITICAL';
      case 'warning':
        return 'HIGH';
      case 'success':
        return 'MEDIUM';
      case 'info':
      default:
        return 'LOW';
    }
  }

  private isActionRequired(notification: NotificationMessage): boolean {
    // Acil durum ve uyarı mesajları için action gerekli
    return notification.type === 'error' || notification.type === 'warning';
  }

  private calculateExpiry(notification: NotificationMessage): Date {
    const now = new Date();
    
    // Mesaj türüne göre süre belirle
    switch (notification.type) {
      case 'error':
        return new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 gün
      case 'warning':
        return new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000); // 3 gün
      case 'success':
        return new Date(now.getTime() + 24 * 60 * 60 * 1000); // 1 gün
      case 'info':
      default:
        return new Date(now.getTime() + 12 * 60 * 60 * 1000); // 12 saat
    }
  }

  private getNotificationType(severity: string): 'info' | 'success' | 'warning' | 'error' {
    switch (severity) {
      case 'LOW':
        return 'info';
      case 'MEDIUM':
        return 'warning';
      case 'HIGH':
        return 'warning';
      case 'CRITICAL':
        return 'error';
      default:
        return 'info';
    }
  }

  private updateNotificationCounts(): void {
    const total = this.notifications.length;
    const unread = this.notifications.filter(n => !n.read).length;
    
    const byType = {
      info: this.notifications.filter(n => n.type === 'info').length,
      success: this.notifications.filter(n => n.type === 'success').length,
      warning: this.notifications.filter(n => n.type === 'warning').length,
      error: this.notifications.filter(n => n.type === 'error').length
    };
    
    const byCategory = {
      SYSTEM: this.notifications.filter(n => n.category === 'SYSTEM').length,
      EMERGENCY: this.notifications.filter(n => n.category === 'EMERGENCY').length,
      ASSIGNMENT: this.notifications.filter(n => n.category === 'ASSIGNMENT').length,
      HELP_REQUEST: this.notifications.filter(n => n.category === 'HELP_REQUEST').length,
      SAFE_ZONE: this.notifications.filter(n => n.category === 'SAFE_ZONE').length
    };
    
    const count: NotificationCount = {
      total,
      unread,
      byType,
      byCategory
    };
    
    this.unreadCountSubject.next(unread);
    this.notificationCountSubject.next(count);
  }

  // Bildirimi okundu olarak işaretle
  markAsRead(notificationId: string): void {
    const notification = this.notifications.find(n => n.id === notificationId);
    if (notification) {
      notification.read = true;
      this.notificationsSubject.next([...this.notifications]);
      this.updateNotificationCounts();
    }
  }

  // Tüm bildirimleri okundu olarak işaretle
  markAllAsRead(): void {
    this.notifications.forEach(n => n.read = true);
    this.notificationsSubject.next([...this.notifications]);
    this.updateNotificationCounts();
  }

  // Bildirimi sil
  deleteNotification(notificationId: string): void {
    this.notifications = this.notifications.filter(n => n.id !== notificationId);
    this.notificationsSubject.next([...this.notifications]);
    this.updateNotificationCounts();
  }

  // Süresi dolmuş bildirimleri temizle
  clearExpiredNotifications(): void {
    const now = new Date();
    this.notifications = this.notifications.filter(n => !n.expires_at || n.expires_at > now);
    this.notificationsSubject.next([...this.notifications]);
    this.updateNotificationCounts();
  }

  // Kategoriye göre bildirimleri getir
  getNotificationsByCategory(category: NotificationEvent['category']): Observable<NotificationEvent[]> {
    return new Observable(observer => {
      const filtered = this.notifications.filter(n => n.category === category);
      observer.next(filtered);
      
      const subscription = this.notifications$.subscribe(notifications => {
        const filteredNotifications = notifications.filter(n => n.category === category);
        observer.next(filteredNotifications);
      });
      
      return () => subscription.unsubscribe();
    });
  }

  // Önceliğe göre bildirimleri getir
  getNotificationsByPriority(priority: NotificationEvent['priority']): Observable<NotificationEvent[]> {
    return new Observable(observer => {
      const filtered = this.notifications.filter(n => n.priority === priority);
      observer.next(filtered);
      
      const subscription = this.notifications$.subscribe(notifications => {
        const filteredNotifications = notifications.filter(n => n.priority === priority);
        observer.next(filteredNotifications);
      });
      
      return () => subscription.unsubscribe();
    });
  }

  // Okunmamış bildirimleri getir
  getUnreadNotifications(): Observable<NotificationEvent[]> {
    return new Observable(observer => {
      const unread = this.notifications.filter(n => !n.read);
      observer.next(unread);
      
      const subscription = this.notifications$.subscribe(notifications => {
        const unreadNotifications = notifications.filter(n => !n.read);
        observer.next(unreadNotifications);
      });
      
      return () => subscription.unsubscribe();
    });
  }

  // Action gerekli bildirimleri getir
  getActionRequiredNotifications(): Observable<NotificationEvent[]> {
    return new Observable(observer => {
      const actionRequired = this.notifications.filter(n => n.action_required);
      observer.next(actionRequired);
      
      const subscription = this.notifications$.subscribe(notifications => {
        const actionRequiredNotifications = notifications.filter(n => n.action_required);
        observer.next(actionRequiredNotifications);
      });
      
      return () => subscription.unsubscribe();
    });
  }

  // Manuel bildirim ekle
  addNotificationManually(notification: NotificationEvent): void {
    this.addNotification(notification);
  }

  // Tüm bildirimleri temizle
  clearAllNotifications(): void {
    this.notifications = [];
    this.notificationsSubject.next([]);
    this.updateNotificationCounts();
  }

  // WebSocket bağlantısını başlat
  connect(): void {
    this.webSocketService.connect();
  }

  // WebSocket bağlantısını kes
  disconnect(): void {
    this.webSocketService.disconnect();
  }

  // Bağlantı durumunu kontrol et
  isConnected(): Observable<boolean> {
    return this.webSocketService.isConnected$;
  }
}
