import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Client, Message, StompSubscription } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

export interface WebSocketMessage {
  type: string;
  message: string;
  data: any;
  timestamp: number;
  userId?: number;
}

export interface MapUpdateEvent {
  eventType: 'CREATED' | 'UPDATED' | 'DELETED';
  entityType: string;
  payload: any;
}

export interface EmergencyAlertEvent {
  alertId: number;
  title: string;
  message: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  latitude: number;
  longitude: number;
  requestId: number;
  timestamp: number;
}

export interface UserLocationEvent {
  userId: number;
  username: string;
  latitude: number;
  longitude: number;
  status: 'AVAILABLE' | 'BUSY' | 'OFFLINE';
  timestamp: number;
}

export interface NotificationMessage {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  created_at: Date;
  user_id?: number;
}

export interface SafezoneUpdate {
  id: number;
  name: string;
  zone_type: string;
  latitude: number;
  longitude: number;
  capacity: number;
  current_occupancy: number;
  status: 'active' | 'inactive' | 'full';
  last_updated: Date;
}

@Injectable({
  providedIn: 'root'
})
export class WebSocketService {
  private stompClient: Client | null = null;
  private socket: any = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectInterval = 3000;
  
  private isConnectedSubject = new BehaviorSubject<boolean>(false);
  private messageSubject = new Subject<WebSocketMessage>();
  private notificationSubject = new Subject<NotificationMessage>();
  private safezoneUpdateSubject = new Subject<SafezoneUpdate>();
  private mapUpdateSubject = new Subject<MapUpdateEvent>();
  private emergencyAlertSubject = new Subject<EmergencyAlertEvent>();
  private userLocationSubject = new Subject<UserLocationEvent>();
  
  public isConnected$ = this.isConnectedSubject.asObservable();
  public messages$ = this.messageSubject.asObservable();
  public notifications$ = this.notificationSubject.asObservable();
  public safezoneUpdates$ = this.safezoneUpdateSubject.asObservable();
  public mapUpdates$ = this.mapUpdateSubject.asObservable();
  public emergencyAlerts$ = this.emergencyAlertSubject.asObservable();
  public userLocations$ = this.userLocationSubject.asObservable();

  constructor() {}

  connect(): void {
    if (this.stompClient?.connected) {
      return;
    }

    const baseUrl = environment.websocketUrl || 'http://localhost:8086/ws';
    let sockjsUrl: string;
    let wsUrlClean: string;

    try {
      // Try SockJS first (for browsers that don't support native WebSocket)
      sockjsUrl = `${baseUrl}`;
      const sockjsFactory = new SockJS(sockjsUrl);
      
      // Create STOMP client
      this.stompClient = new Client({
        webSocketFactory: () => sockjsFactory,
        debug: (str) => {
          // Debug logging can be enabled here if needed
        },
        reconnectDelay: this.reconnectInterval,
        heartbeatIncoming: 4000,
        heartbeatOutgoing: 4000
      });

      // Set up event handlers
      this.stompClient.onConnect = (frame) => {
        this.isConnectedSubject.next(true);
        this.reconnectAttempts = 0;
        
        // Subscribe to topics
        this.subscribeToTopics();
      };

      this.stompClient.onStompError = (frame) => {
        this.isConnectedSubject.next(false);
        this.scheduleReconnect();
      };

      this.stompClient.onDisconnect = () => {
        this.isConnectedSubject.next(false);
        this.scheduleReconnect();
      };

      // Connect to STOMP
      this.stompClient.activate();

    } catch (error) {
      // If SockJS fails, try native WebSocket
      try {
        wsUrlClean = baseUrl.replace(/^https?:\/\//, 'ws://');
        if (baseUrl.startsWith('https://')) {
          wsUrlClean = baseUrl.replace(/^https:\/\//, 'wss://');
        }

        this.stompClient = new Client({
          brokerURL: wsUrlClean,
          debug: (str) => {
            // Debug logging can be enabled here if needed
          },
          reconnectDelay: this.reconnectInterval,
          heartbeatIncoming: 4000,
          heartbeatOutgoing: 4000
        });

        // Set up the same event handlers
        this.stompClient.onConnect = (frame) => {
          this.isConnectedSubject.next(true);
          this.reconnectAttempts = 0;
          
          this.subscribeToTopics();
        };

        this.stompClient.onStompError = (frame) => {
          this.isConnectedSubject.next(false);
          this.scheduleReconnect();
        };

        this.stompClient.onDisconnect = () => {
          this.isConnectedSubject.next(false);
          this.scheduleReconnect();
        };

        this.stompClient.activate();

      } catch (wsError) {
        // Both SockJS and native WebSocket failed
        this.isConnectedSubject.next(false);
        
        // Enable polling mode
        this.enablePollingMode();
      }
    }
  }

  private subscribeToTopics(): void {
    if (!this.stompClient?.connected) {
      return;
    }

    // Subscribe to map updates
    this.stompClient.subscribe('/topic/map-updates', (message) => {
      try {
        const mapUpdate = JSON.parse(message.body);
        
        // Emit map update
        this.mapUpdateSubject.next(mapUpdate);
        
        // Also emit to specific entity types
        if (mapUpdate.entityType === 'help-request') {
          // this.handleHelpRequestUpdate(mapUpdate); // Original code had this line commented out
        } else if (mapUpdate.entityType === 'assignment') {
          // this.handleAssignmentUpdate(mapUpdate); // Original code had this line commented out
        }
        
      } catch (error) {
        // Handle parsing error
      }
    });

    // Subscribe to emergency alerts
    this.stompClient.subscribe('/topic/emergency-alerts', (message) => {
      try {
        const emergencyAlert = JSON.parse(message.body);
        this.emergencyAlertSubject.next(emergencyAlert);
        
        // Notification olarak da göster
        this.notificationSubject.next({
          id: emergencyAlert.alertId.toString(),
          title: emergencyAlert.title,
          message: emergencyAlert.message,
          type: this.getNotificationType(emergencyAlert.severity),
          read: false,
          created_at: new Date(emergencyAlert.timestamp)
        });
      } catch (error) {
        // Handle parsing error
      }
    });

    // Subscribe to user location updates
    this.stompClient.subscribe('/topic/user-locations', (message) => {
      try {
        const userLocation = JSON.parse(message.body);
        this.userLocationSubject.next(userLocation);
      } catch (error) {
        // Handle parsing error
      }
    });

    // Subscribe to notifications
    this.stompClient.subscribe('/topic/notifications', (message) => {
      try {
        const notification = JSON.parse(message.body);
        this.notificationSubject.next(notification);
      } catch (error) {
        // Handle parsing error
      }
    });
  }

  private handleHelpRequestUpdate(mapUpdate: MapUpdateEvent): void {
    // Help request güncellemelerini işle
  }

  private handleSafezoneUpdate(mapUpdate: MapUpdateEvent): void {
    // Safezone güncellemelerini işle
    if (mapUpdate.payload) {
      this.safezoneUpdateSubject.next(mapUpdate.payload);
    }
  }

  private handleAssignmentUpdate(mapUpdate: MapUpdateEvent): void {
    // Assignment güncellemelerini işle
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

  // Map güncellemesi gönder
  sendMapUpdate(mapUpdate: MapUpdateEvent): void {
    if (this.stompClient && this.stompClient.connected) {
      this.stompClient.publish({
        destination: '/app/map-update',
        body: JSON.stringify(mapUpdate)
      });
    }
  }

  // Kullanıcı konum güncellemesi gönder
  sendUserLocation(userLocation: UserLocationEvent): void {
    if (this.stompClient && this.stompClient.connected) {
      this.stompClient.publish({
        destination: '/app/user-location',
        body: JSON.stringify(userLocation)
      });
    }
  }

  // Acil durum uyarısı gönder
  sendEmergencyAlert(emergencyAlert: EmergencyAlertEvent): void {
    if (this.stompClient && this.stompClient.connected) {
      this.stompClient.publish({
        destination: '/app/emergency-alert',
        body: JSON.stringify(emergencyAlert)
      });
    }
  }

  // Genel mesaj gönder
  sendMessage(message: WebSocketMessage): void {
    if (this.stompClient && this.stompClient.connected) {
      this.stompClient.publish({
        destination: '/app/message',
        body: JSON.stringify(message)
      });
    }
  }

  private scheduleReconnect(): void {
    this.reconnectAttempts++;
    if (this.reconnectAttempts <= this.maxReconnectAttempts) {
      setTimeout(() => {
        this.connect();
      }, this.reconnectInterval);
    } else {
      this.enablePollingMode();
    }
  }

  private enablePollingMode(): void {
    // Enable polling mode when WebSocket fails
    // this.isPollingMode = true; // Original code had this line commented out
    // this.connectionEventSubject.next({ type: 'polling_enabled', data: null }); // Original code had this line commented out
  }

  disconnect(): void {
    if (this.stompClient) {
      this.stompClient.deactivate();
      this.stompClient = null;
    }
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
    this.isConnectedSubject.next(false);
  }

  // Bağlantı durumunu test et
  testConnection(): boolean {
    if (this.stompClient) {
      return this.stompClient.connected;
    }
    return false;
  }

  // Cleanup on destroy
  ngOnDestroy(): void {
    this.disconnect();
  }
}
