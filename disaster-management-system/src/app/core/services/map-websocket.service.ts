import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { WebSocketService, MapUpdateEvent, EmergencyAlertEvent, UserLocationEvent } from './websocket.service';

export interface MapEntity {
  id: number;
  type: 'HELP_REQUEST' | 'SAFE_ZONE' | 'ASSIGNMENT' | 'EMERGENCY_ALERT' | 'USER_LOCATION';
  latitude: number;
  longitude: number;
  data: any;
  timestamp: number;
}

export interface MapUpdate {
  entities: MapEntity[];
  lastUpdate: number;
}

@Injectable({
  providedIn: 'root'
})
export class MapWebSocketService {
  private mapEntitiesSubject = new BehaviorSubject<MapEntity[]>([]);
  private mapUpdateSubject = new Subject<MapUpdate>();
  private emergencyAlertsSubject = new Subject<EmergencyAlertEvent>();
  private userLocationsSubject = new BehaviorSubject<UserLocationEvent[]>([]);
  
  public mapEntities$ = this.mapEntitiesSubject.asObservable();
  public mapUpdates$ = this.mapUpdateSubject.asObservable();
  public emergencyAlerts$ = this.emergencyAlertsSubject.asObservable();
  public userLocations$ = this.userLocationsSubject.asObservable();

  private mapEntities: MapEntity[] = [];
  private userLocations: UserLocationEvent[] = [];

  constructor(private webSocketService: WebSocketService) {
    this.initializeWebSocketSubscriptions();
  }

  private initializeWebSocketSubscriptions(): void {
    // Map güncellemelerini dinle
    this.webSocketService.mapUpdates$.subscribe((mapUpdate: MapUpdateEvent) => {
      this.handleMapUpdate(mapUpdate);
    });

    // Acil durum uyarılarını dinle
    this.webSocketService.emergencyAlerts$.subscribe((alert: EmergencyAlertEvent) => {
      this.handleEmergencyAlert(alert);
    });

    // Kullanıcı konum güncellemelerini dinle
    this.webSocketService.userLocations$.subscribe((userLocation: UserLocationEvent) => {
      this.handleUserLocationUpdate(userLocation);
    });
  }

  private handleMapUpdate(mapUpdate: MapUpdateEvent): void {
    const entity: MapEntity = {
      id: this.generateEntityId(mapUpdate),
      type: this.mapEntityTypeToMapEntityType(mapUpdate.entityType),
      latitude: this.extractLatitude(mapUpdate.payload),
      longitude: this.extractLongitude(mapUpdate.payload),
      data: mapUpdate.payload,
      timestamp: Date.now()
    };

    switch (mapUpdate.eventType) {
      case 'CREATED':
        this.addMapEntity(entity);
        break;
      case 'UPDATED':
        this.updateMapEntity(entity);
        break;
      case 'DELETED':
        this.removeMapEntity(entity.id);
        break;
    }

    // Map update event'ini yayınla
    this.mapUpdateSubject.next({
      entities: [...this.mapEntities],
      lastUpdate: Date.now()
    });
  }

  private handleEmergencyAlert(alert: EmergencyAlertEvent): void {
    this.emergencyAlertsSubject.next(alert);
    
    // Emergency alert'i map entity olarak da ekle
    const entity: MapEntity = {
      id: alert.alertId,
      type: 'EMERGENCY_ALERT',
      latitude: alert.latitude,
      longitude: alert.longitude,
      data: alert,
      timestamp: alert.timestamp
    };
    
    this.addMapEntity(entity);
  }

  private handleUserLocationUpdate(userLocation: UserLocationEvent): void {
    // Mevcut kullanıcı konumunu güncelle
    const existingIndex = this.userLocations.findIndex(ul => ul.userId === userLocation.userId);
    
    if (existingIndex >= 0) {
      this.userLocations[existingIndex] = userLocation;
    } else {
      this.userLocations.push(userLocation);
    }
    
    this.userLocationsSubject.next([...this.userLocations]);
    
    // User location'ı map entity olarak da ekle/güncelle
    const entity: MapEntity = {
      id: userLocation.userId,
      type: 'USER_LOCATION',
      latitude: userLocation.latitude,
      longitude: userLocation.longitude,
      data: userLocation,
      timestamp: userLocation.timestamp
    };
    
    this.updateMapEntity(entity);
  }

  private addMapEntity(entity: MapEntity): void {
    const existingIndex = this.mapEntities.findIndex(e => e.id === entity.id && e.type === entity.type);
    
    if (existingIndex >= 0) {
      this.mapEntities[existingIndex] = entity;
    } else {
      this.mapEntities.push(entity);
    }
    
    this.mapEntitiesSubject.next([...this.mapEntities]);
  }

  private updateMapEntity(entity: MapEntity): void {
    const existingIndex = this.mapEntities.findIndex(e => e.id === entity.id && e.type === entity.type);
    
    if (existingIndex >= 0) {
      this.mapEntities[existingIndex] = entity;
      this.mapEntitiesSubject.next([...this.mapEntities]);
    }
  }

  private removeMapEntity(entityId: number): void {
    this.mapEntities = this.mapEntities.filter(e => e.id !== entityId);
    this.mapEntitiesSubject.next([...this.mapEntities]);
  }

  private generateEntityId(mapUpdate: MapUpdateEvent): number {
    // Entity type ve payload'dan unique ID oluştur
    if (mapUpdate.payload && mapUpdate.payload.id) {
      return mapUpdate.payload.id;
    }
    return Date.now(); // Fallback ID
  }

  private mapEntityTypeToMapEntityType(entityType: string): MapEntity['type'] {
    switch (entityType) {
      case 'HELP_REQUEST':
        return 'HELP_REQUEST';
      case 'SAFE_ZONE':
        return 'SAFE_ZONE';
      case 'ASSIGNMENT':
        return 'ASSIGNMENT';
      default:
        return 'HELP_REQUEST';
    }
  }

  private extractLatitude(payload: any): number {
    if (payload && payload.latitude !== undefined) {
      return payload.latitude;
    }
    if (payload && payload.location && payload.location.latitude !== undefined) {
      return payload.location.latitude;
    }
    return 0;
  }

  private extractLongitude(payload: any): number {
    if (payload && payload.longitude !== undefined) {
      return payload.longitude;
    }
    if (payload && payload.location && payload.location.longitude !== undefined) {
      return payload.location.longitude;
    }
    return 0;
  }

  // Map entity'leri filtrele
  getMapEntitiesByType(type: MapEntity['type']): Observable<MapEntity[]> {
    return new Observable(observer => {
      const filteredEntities = this.mapEntities.filter(entity => entity.type === type);
      observer.next(filteredEntities);
      
      // Future updates'leri de dinle
      const subscription = this.mapEntities$.subscribe(entities => {
        const filtered = entities.filter(entity => entity.type === type);
        observer.next(filtered);
      });
      
      return () => subscription.unsubscribe();
    });
  }

  // Belirli bir bölgedeki entity'leri getir
  getMapEntitiesInBounds(
    north: number, 
    south: number, 
    east: number, 
    west: number
  ): Observable<MapEntity[]> {
    return new Observable(observer => {
      const entitiesInBounds = this.mapEntities.filter(entity => 
        entity.latitude >= south && 
        entity.latitude <= north && 
        entity.longitude >= west && 
        entity.longitude <= east
      );
      
      observer.next(entitiesInBounds);
      
      // Future updates'leri de dinle
      const subscription = this.mapEntities$.subscribe(entities => {
        const filtered = entities.filter(entity => 
          entity.latitude >= south && 
          entity.latitude <= north && 
          entity.longitude >= west && 
          entity.longitude <= east
        );
        observer.next(filtered);
      });
      
      return () => subscription.unsubscribe();
    });
  }

  // Map entity'yi manuel olarak güncelle
  updateMapEntityManually(entity: MapEntity): void {
    this.updateMapEntity(entity);
  }

  // Map entity'yi manuel olarak sil
  removeMapEntityManually(entityId: number): void {
    this.removeMapEntity(entityId);
  }

  // Tüm map entity'leri temizle
  clearAllMapEntities(): void {
    this.mapEntities = [];
    this.mapEntitiesSubject.next([]);
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
