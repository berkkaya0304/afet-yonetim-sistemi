import { Component, OnInit, OnDestroy, AfterViewInit, ElementRef, ViewChild, ChangeDetectorRef, ChangeDetectionStrategy, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { MapWebSocketService, MapEntity } from '../../core/services/map-websocket.service';
import { NotificationWebSocketService, NotificationEvent } from '../../core/services/notification-websocket.service';
import * as L from 'leaflet';

@Component({
  selector: 'app-real-time-map',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrls: ['./real-time-map.component.scss','./real-time-map2.component.scss'],
  template: `
    <div class="real-time-map-container">
      <!-- WebSocket Bağlantı Durumu -->
      <div class="connection-status" [class.connected]="isConnected" [class.disconnected]="!isConnected">
        <span class="status-indicator"></span>
        @if (showOnlySafezones && isConnected) {
          <span class="safezone-status">
            <strong>Canlı</strong>
          </span>
        }
        @if (!showOnlySafezones && isConnected) {
          <span>
            Gerçek Zamanlı Bağlantı Aktif
          </span>
        }
        @if (!isConnected) {
          <span>Bağlantı Kesildi</span>
        }
      </div>

      <!-- Harita Kontrolleri -->
      <div class="map-controls">
        @if (!showOnlySafezones) {
          <div class="control-group">
            @for (type of availableEntityTypes; track type) {
              <button 
                (click)="toggleEntityType(type)"
                [class.active]="visibleEntityTypes.includes(type)"
                class="control-btn">
                {{ getEntityTypeLabel(type) }} ({{ getEntityCountByType(type) }})
              </button>
            }
          </div>
        }
        
        <div class="control-group">
          <button (click)="centerMap()" class="control-btn btn-secondary">
            <span>🗺️</span> Haritayı Ortala
          </button>
          <button (click)="clearAllEntities()" class="control-btn btn-danger">
            <span>🗑️</span> Temizle
          </button>
        </div>
      </div>

      <!-- Ana Harita -->
      <div class="map-container">
        <div #mapContainer class="leaflet-map"></div>
        
        <!-- Harita Yükleniyor Overlay -->
        @if (!mapInitialized) {
          <div class="map-loading-overlay">
            <div class="loading-content">
              <div class="spinner"></div>
              <p>Harita yükleniyor...</p>
            </div>
          </div>
        }

        <!-- Örnek Veriler Yükleniyor -->
        @if (mapInitialized && !isConnected && !sampleDataLoaded) {
          <div class="sample-data-overlay">
            <div class="sample-data-content">
              <div class="sample-data-spinner"></div>
              <p>Örnek veriler yükleniyor...</p>
              <p class="sample-data-info">Gerçek zamanlı veriler için WebSocket bağlantısı bekleniyor</p>
            </div>
          </div>
        }

        <!-- Deprem Simülasyonu Çalışıyor -->
        @if (isSimulating) {
          <div class="earthquake-simulation-overlay">
            <div class="earthquake-simulation-content">
              <div class="earthquake-icon">🌋</div>
              <h3>İstanbul Deprem Simülasyonu Çalışıyor</h3>
              <div class="earthquake-spinner"></div>
              <p>150+ veri girişi simüle ediliyor...</p>
              <p class="simulation-info">Deprem sonrası acil durum müdahalesi simüle ediliyor</p>
              <div class="simulation-progress">
                <div class="progress-bar">
                  <div class="progress-fill"></div>
                </div>
                <span class="progress-text">Veriler oluşturuluyor...</span>
              </div>
            </div>
          </div>
        }
      </div>

      <!-- Harita Bilgileri -->
      <div class="map-info-panel">
        <div class="info-section">
          <h4>📊 Harita İstatistikleri</h4>
          <div class="stats-grid">
            <div class="stat-item">
              <span class="stat-label">{{ showOnlySafezones ? 'Güvenli Bölge' : 'Toplam Varlık' }}:</span>
              <span class="stat-value">{{ showOnlySafezones ? getEntityCountByType('SAFE_ZONE') : mapEntities.length }}</span>
            </div>
            @if (!showOnlySafezones) {
              <div class="stat-item">
                <span class="stat-label">Aktif Kullanıcı:</span>
                <span class="stat-value">{{ userLocations.length }}</span>
              </div>
            }
            @if (!showOnlySafezones) {
              <div class="stat-item">
                <span class="stat-label">Acil Durum:</span>
                <span class="stat-value">{{ emergencyAlerts.length }}</span>
              </div>
            }
          </div>
          @if (!isConnected && sampleDataLoaded) {
            <div class="sample-data-notice">
              <span class="sample-data-badge">📋 Örnek Veriler</span>
              <p class="sample-data-text">Şu anda haritada gösterilen veriler örnek verilerdir. Gerçek zamanlı veriler için WebSocket bağlantısı kurulması bekleniyor.</p>
            </div>
          }
          @if (isSimulating) {
            <div class="earthquake-simulation-notice">
              <span class="earthquake-simulation-badge">🌋 DEPREM SİMÜLASYONU</span>
              <p class="earthquake-simulation-text">İstanbul deprem simülasyonu çalışıyor! 150+ veri girişi simüle ediliyor.</p>
              <div class="simulation-stats">
                <span class="stat-item">📊 Toplam Veri: {{ mapEntities.length }}</span>
                <span class="stat-item">⏱️ Süre: 5 saniye</span>
              </div>
            </div>
          }
        </div>

        <div class="info-section">
          <h4>🎯 Görünür Varlık Türleri</h4>
          <div class="visible-types">
            @for (type of visibleEntityTypes; track type) {
              <span 
                class="type-badge"
                [class]="'type-' + type.toLowerCase()">
                {{ getEntityTypeLabel(type) }}
              </span>
            }
          </div>
        </div>
      </div>

      <!-- Kontrol Butonları -->
      <div class="control-buttons">
        @if (!showOnlySafezones) {
          <div class="test-buttons">
            <h4>🧪 Test Butonları</h4>
            <div class="test-button-group">
              <button (click)="testHelpRequest()" class="btn btn-warning">
                <span>🆘</span> Yardım Talebi
              </button>
              <button (click)="testSafezone()" class="btn btn-success">
                <span>🛡️</span> Güvenli Bölge
              </button>
              <button (click)="testAssignment()" class="btn btn-primary">
                <span>📋</span> Görev
              </button>
              <button (click)="testEmergencyAlert()" class="btn btn-danger">
                <span>🚨</span> Acil Durum
              </button>
              <button (click)="testUserLocation()" class="btn btn-purple">
                <span>👤</span> Kullanıcı Konumu
              </button>
              <button (click)="testAllEntities()" class="btn btn-info">
                <span>🎯</span> Tümünü Test Et
              </button>
              <button (click)="simulateIstanbulEarthquake()" class="btn btn-earthquake">
                <span>🌋</span> İstanbul Deprem Simülasyonu
              </button>
            </div>
          </div>
        }
        @if (showOnlySafezones) {
          <div class="test-buttons">
            <h4>🧪 Safezone Test</h4>
            <div class="test-button-group">
              <button (click)="testSafezone()" class="btn btn-success">
                <span>🛡️</span> Güvenli Bölge Ekle
              </button>
              <button (click)="testMultipleSafezones()" class="btn btn-info">
                <span>🛡️🛡️🛡️</span> Çoklu Güvenli Bölge
              </button>
            </div>
          </div>
        }
      </div>
    </div>
  `,
})
export class RealTimeMapComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('mapContainer', { static: false }) mapContainer!: ElementRef;
  @Input() showOnlySafezones = false;
  
  isConnected = false;
  mapInitialized = false;
  sampleDataLoaded = false; // Örnek verilerin yüklenip yüklenmediğini takip et
  isSimulating = false; // Deprem simülasyonu durumunu takip et
  mapEntities: MapEntity[] = [];
  emergencyAlerts: any[] = [];
  userLocations: any[] = [];
  
  // Entity types that are available for this instance
  get availableEntityTypes(): MapEntity['type'][] {
    if (this.showOnlySafezones) {
      return ['SAFE_ZONE'];
    }
    return ['HELP_REQUEST', 'SAFE_ZONE', 'ASSIGNMENT', 'EMERGENCY_ALERT', 'USER_LOCATION'];
  }
  
  // Entity types that are currently visible
  get visibleEntityTypes(): MapEntity['type'][] {
    if (this.showOnlySafezones) {
      return ['SAFE_ZONE'];
    }
    return this._visibleEntityTypes;
  }
  
  private _visibleEntityTypes: MapEntity['type'][] = ['HELP_REQUEST', 'SAFE_ZONE', 'ASSIGNMENT', 'EMERGENCY_ALERT', 'USER_LOCATION'];
  
  entityTypes: MapEntity['type'][] = ['HELP_REQUEST', 'SAFE_ZONE', 'ASSIGNMENT', 'EMERGENCY_ALERT', 'USER_LOCATION'];
  
  private map!: L.Map;
  private markers: Map<string, L.Marker> = new Map();
  private subscriptions: Subscription[] = [];

  constructor(
    private mapWebSocketService: MapWebSocketService,
    private notificationWebSocketService: NotificationWebSocketService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    // Değişiklikleri bir sonraki tick'te yap
    setTimeout(() => {
      this.initializeSubscriptions();
      this.connect();
      this.loadSampleData(); // Örnek verileri yükle
    }, 0);
  }

  ngAfterViewInit(): void {
    // Değişiklikleri bir sonraki tick'te yap
    setTimeout(() => {
      this.initializeMap();
    }, 0);
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
    this.disconnect();
    if (this.map) {
      this.map.remove();
    }
  }

  private initializeMap(): void {
    console.log('initializeMap çağrıldı, mapContainer:', this.mapContainer);
    
    if (!this.mapContainer) {
      console.error('mapContainer bulunamadı!');
      return;
    }

    try {
      // Türkiye'nin merkezi koordinatları
      const turkeyCenter: [number, number] = [39.9334, 32.8597];
      console.log('Harita merkezi ayarlanıyor:', turkeyCenter);
      
      this.map = L.map(this.mapContainer.nativeElement, {
        center: turkeyCenter,
        zoom: 6,
        zoomControl: false, // Varsayılan zoom kontrolünü kapat
        attributionControl: false, // Attribution kontrolünü kapat
        doubleClickZoom: true,
        scrollWheelZoom: true,
        dragging: true,
        touchZoom: true,
        boxZoom: true,
        keyboard: true
      });
      
      console.log('Leaflet map oluşturuldu:', this.map);
      
      // OpenStreetMap tile layer ekle
      const tileLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 18,
        minZoom: 3
      });
      
      console.log('Tile layer oluşturuldu, haritaya ekleniyor...');
      tileLayer.addTo(this.map);
      console.log('Tile layer haritaya eklendi');

      // Özel zoom kontrolleri ekle
      this.addCustomZoomControls();

      // Harita tıklama olayı
      this.map.on('click', (e: L.LeafletMouseEvent) => {
        const { lat, lng } = e.latlng;
        console.log(`Haritaya tıklandı: ${lat}, ${lng}`);
      });

      this.mapInitialized = true;
      console.log('Harita başarıyla initialize edildi');
      
      // Change detection'ı manuel olarak tetikle
      this.cdr.detectChanges();
      
    } catch (error) {
      console.error('Harita initialize edilirken hata:', error);
      this.mapInitialized = false;
      // Change detection'ı manuel olarak tetikle
      this.cdr.detectChanges();
    }
  }

  private addCustomZoomControls(): void {
    // Zoom in butonu
    const zoomInButton = L.Control.extend({
      options: { position: 'topright' },
      onAdd: () => {
        const div = L.DomUtil.create('div', 'custom-zoom-control zoom-in');
        div.innerHTML = '<span>+</span>';
        div.title = 'Yakınlaştır';
        
        div.onclick = () => {
          this.map.zoomIn();
        };
        
        return div;
      }
    });
    new zoomInButton().addTo(this.map);

    // Zoom out butonu
    const zoomOutButton = L.Control.extend({
      options: { position: 'topright' },
      onAdd: () => {
        const div = L.DomUtil.create('div', 'custom-zoom-control zoom-out');
        div.innerHTML = '<span>−</span>';
        div.title = 'Uzaklaştır';
        
        div.onclick = () => {
          this.map.zoomOut();
        };
        
        return div;
      }
    });
    new zoomOutButton().addTo(this.map);

    // Haritayı ortala butonu
    const centerButton = L.Control.extend({
      options: { position: 'topright' },
      onAdd: () => {
        const div = L.DomUtil.create('div', 'custom-zoom-control center-map');
        div.innerHTML = '<span>⌂</span>';
        div.title = 'Haritayı Ortala';
        
        div.onclick = () => {
          this.centerMap();
        };
        
        return div;
      }
    });
    new centerButton().addTo(this.map);
  }

  private initializeSubscriptions(): void {
    console.log('initializeSubscriptions çağrıldı');
    
    // Map entities subscription
    this.subscriptions.push(
      this.mapWebSocketService.mapEntities$.subscribe(entities => {
        console.log('Map entities güncellendi:', entities);
        this.mapEntities = entities;
        this.updateMapMarkers();
      })
    );

    // Emergency alerts subscription
    this.subscriptions.push(
      this.mapWebSocketService.emergencyAlerts$.subscribe(alert => {
        console.log('Emergency alert alındı:', alert);
        this.emergencyAlerts.unshift(alert);
        if (this.emergencyAlerts.length > 10) {
          this.emergencyAlerts = this.emergencyAlerts.slice(0, 10);
        }
        this.addEmergencyAlertMarker(alert);
      })
    );

    // User locations subscription
    this.subscriptions.push(
      this.mapWebSocketService.userLocations$.subscribe(locations => {
        console.log('User locations güncellendi:', locations);
        this.userLocations = locations;
        this.updateUserLocationMarkers(locations);
      })
    );

    // Connection status subscription
    this.subscriptions.push(
      this.mapWebSocketService.isConnected().subscribe((connected: boolean) => {
        console.log('WebSocket bağlantı durumu değişti:', connected);
        this.isConnected = connected;
        // Change detection'ı manuel olarak tetikle
        this.cdr.detectChanges();
      })
    );
    
    console.log('Tüm subscription\'lar kuruldu');
  }

  private updateMapMarkers(): void {
    // Mevcut marker'ları temizle
    this.markers.forEach(marker => marker.remove());
    this.markers.clear();

    // Yeni marker'ları ekle
    if (this.showOnlySafezones) {
      // Only show safezone entities
      this.mapEntities.forEach(entity => {
        if (entity.type === 'SAFE_ZONE') {
          this.addEntityMarker(entity);
        }
      });
    } else {
      // Show all visible entity types
      this.mapEntities.forEach(entity => {
        if (this.visibleEntityTypes.includes(entity.type)) {
          this.addEntityMarker(entity);
        }
      });
    }
    
    // Change detection'ı manuel olarak tetikle
    this.cdr.detectChanges();
  }

  private addEntityMarker(entity: MapEntity): void {
    const markerId = `${entity.type}_${entity.id}`;
    
    // Marker ikonu ve rengi belirle
    const icon = this.getMarkerIcon(entity.type);
    
    const marker = L.marker([entity.latitude, entity.longitude], { icon })
      .addTo(this.map)
      .bindPopup(this.createPopupContent(entity));

    this.markers.set(markerId, marker);
    
    // Change detection'ı manuel olarak tetikle
    this.cdr.detectChanges();
  }

  private addEmergencyAlertMarker(alert: any): void {
    if (this.showOnlySafezones) {
      // Don't add emergency alert markers when showing only safezones
      return;
    }
    
    const markerId = `EMERGENCY_ALERT_${alert.alertId}`;
    
    if (this.markers.has(markerId)) return;

    const icon = this.getMarkerIcon('EMERGENCY_ALERT');
    
    const marker = L.marker([alert.latitude, alert.longitude], { icon })
      .addTo(this.map)
      .bindPopup(this.createEmergencyAlertPopup(alert));

    this.markers.set(markerId, marker);
    
    // Change detection'ı manuel olarak tetikle
    this.cdr.detectChanges();
  }

  private updateUserLocationMarkers(locations: any[]): void {
    if (this.showOnlySafezones) {
      // Don't add user location markers when showing only safezones
      return;
    }
    
    // Kullanıcı konum marker'larını güncelle
    locations.forEach(location => {
      const markerId = `USER_LOCATION_${location.userId}`;
      
      if (this.markers.has(markerId)) {
        const existingMarker = this.markers.get(markerId);
        existingMarker?.setLatLng([location.latitude, location.longitude]);
      } else {
        const icon = this.getMarkerIcon('USER_LOCATION');
        const marker = L.marker([location.latitude, location.longitude], { icon })
          .addTo(this.map)
          .bindPopup(this.createUserLocationPopup(location));
        this.markers.set(markerId, marker);
      }
    });
    
    // Change detection'ı manuel olarak tetikle
    this.cdr.detectChanges();
  }

  private getMarkerIcon(type: string): L.Icon {
    const iconSize: [number, number] = [32, 32];
    const iconAnchor: [number, number] = [16, 32];
    const popupAnchor: [number, number] = [0, -32];

    let color: string;
    let iconClass: string;

    switch (type) {
      case 'HELP_REQUEST':
        color = '#f59e0b'; // Amber
        iconClass = 'help-request-icon';
        break;
      case 'SAFE_ZONE':
        color = '#10b981'; // Green
        iconClass = 'safe-zone-icon';
        break;
      case 'ASSIGNMENT':
        color = '#3b82f6'; // Blue
        iconClass = 'assignment-icon';
        break;
      case 'EMERGENCY_ALERT':
        color = '#ef4444'; // Red
        iconClass = 'emergency-alert-icon';
        break;
      case 'USER_LOCATION':
        color = '#8b5cf6'; // Purple
        iconClass = 'user-location-icon';
        break;
      default:
        color = '#6b7280'; // Gray
        iconClass = 'default-icon';
    }

    // Özel SVG ikonlar oluştur
    const svg = this.createCustomSVG(type, color);
    const dataUrl = 'data:image/svg+xml;base64,' + btoa(svg);
    
    return L.icon({
      iconUrl: dataUrl,
      iconSize,
      iconAnchor,
      popupAnchor,
      className: iconClass
    });
  }

  private createCustomSVG(type: string, color: string): string {
    switch (type) {
      case 'HELP_REQUEST':
        return `
          <svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
            <circle cx="16" cy="16" r="14" fill="${color}" stroke="white" stroke-width="2"/>
            <path d="M16 8v8m0 4v2" stroke="white" stroke-width="2" stroke-linecap="round"/>
            <circle cx="16" cy="6" r="1" fill="white"/>
          </svg>
        `;
      
      case 'SAFE_ZONE':
        return `
          <svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
            <circle cx="16" cy="16" r="14" fill="${color}" stroke="white" stroke-width="2"/>
            <path d="M16 8l4 4-4 4-4-4 4-4z" fill="white"/>
            <circle cx="16" cy="20" r="2" fill="white"/>
          </svg>
        `;
      
      case 'ASSIGNMENT':
        return `
          <svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
            <circle cx="16" cy="16" r="14" fill="${color}" stroke="white" stroke-width="2"/>
            <path d="M12 12h8v2h-8v-2zm0 4h6v2h-6v-2z" fill="white"/>
            <path d="M14 8h4v2h-4v-2z" fill="white"/>
          </svg>
        `;
      
      case 'EMERGENCY_ALERT':
        return `
          <svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
            <circle cx="16" cy="16" r="14" fill="${color}" stroke="white" stroke-width="2"/>
            <path d="M16 8l2 6h-4l2-6z" fill="white"/>
            <circle cx="16" cy="22" r="1" fill="white"/>
          </svg>
        `;
      
      case 'USER_LOCATION':
        return `
          <svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
            <circle cx="16" cy="16" r="14" fill="${color}" stroke="white" stroke-width="2"/>
            <circle cx="16" cy="12" r="3" fill="white"/>
            <path d="M10 20c0-3.3 2.7-6 6-6s6 2.7 6 6" fill="white"/>
          </svg>
        `;
      
      default:
        return `
          <svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
            <circle cx="16" cy="16" r="14" fill="${color}" stroke="white" stroke-width="2"/>
            <circle cx="16" cy="16" r="4" fill="white"/>
          </svg>
        `;
    }
  }

  private createPopupContent(entity: MapEntity): string {
    if (entity.type === 'SAFE_ZONE') {
      return `
        <div class="entity-popup safezone-popup">
          <div class="popup-header safezone-header">
            <div class="popup-icon">🛡️</div>
            <div class="popup-title">
              <h4>${entity.data?.name || `Güvenli Bölge #${entity.id}`}</h4>
              <span class="popup-subtitle">Güvenli Bölge</span>
            </div>
          </div>
          <div class="popup-content">
            <div class="popup-info-item">
              <span class="info-label">📍 Tür:</span>
              <span class="info-value">${this.getSafezoneTypeLabel(entity.data?.zone_type)}</span>
            </div>
            <div class="popup-info-item">
              <span class="info-label">🌍 Konum:</span>
              <span class="info-value">${entity.data?.location || 'Belirtilmemiş'}</span>
            </div>
            <div class="popup-info-item">
              <span class="info-label">📐 Koordinatlar:</span>
              <span class="info-value">${entity.latitude.toFixed(6)}, ${entity.longitude.toFixed(6)}</span>
            </div>
            <div class="popup-info-item">
              <span class="info-label">🕒 Oluşturulma:</span>
              <span class="info-value">${this.formatTimestamp(entity.timestamp)}</span>
            </div>
            ${this.showOnlySafezones ? '<div class="popup-status active">🟢 Aktif</div>' : ''}
          </div>
        </div>
      `;
    }
    
    if (this.showOnlySafezones) {
      return `
        <div class="entity-popup safezone-popup">
          <div class="popup-header safezone-header">
            <div class="popup-icon">🛡️</div>
            <div class="popup-title">
              <h4>Güvenli Bölge #${entity.id}</h4>
              <span class="popup-subtitle">Güvenli Bölge</span>
            </div>
          </div>
          <div class="popup-content">
            <div class="popup-info-item">
              <span class="info-label">📐 Koordinatlar:</span>
              <span class="info-value">${entity.latitude.toFixed(6)}, ${entity.longitude.toFixed(6)}</span>
            </div>
            <div class="popup-info-item">
              <span class="info-label">🕒 Zaman:</span>
              <span class="info-value">${this.formatTimestamp(entity.timestamp)}</span>
            </div>
          </div>
        </div>
      `;
    }
    
    return `
      <div class="entity-popup ${entity.type.toLowerCase()}-popup">
        <div class="popup-header ${entity.type.toLowerCase()}-header">
          <div class="popup-icon">${this.getEntityTypeIcon(entity.type)}</div>
          <div class="popup-title">
            <h4>${this.getEntityTypeLabel(entity.type)} #${entity.id}</h4>
            <span class="popup-subtitle">${this.getEntityTypeLabel(entity.type)}</span>
          </div>
        </div>
        <div class="popup-content">
          <div class="popup-info-item">
            <span class="info-label">📐 Koordinatlar:</span>
            <span class="info-value">${entity.latitude.toFixed(6)}, ${entity.longitude.toFixed(6)}</span>
          </div>
          <div class="popup-info-item">
            <span class="info-label">🕒 Zaman:</span>
            <span class="info-value">${this.formatTimestamp(entity.timestamp)}</span>
          </div>
          ${entity.data?.description ? `
            <div class="popup-info-item">
              <span class="info-label">📝 Açıklama:</span>
              <span class="info-value">${entity.data.description}</span>
            </div>
          ` : ''}
        </div>
      </div>
    `;
  }

  private createEmergencyAlertPopup(alert: any): string {
    return `
      <div class="entity-popup emergency-popup">
        <div class="popup-header emergency-header">
          <div class="popup-icon">🚨</div>
          <div class="popup-title">
            <h4>${alert.title}</h4>
            <span class="popup-subtitle">Acil Durum</span>
          </div>
        </div>
        <div class="popup-content">
          <div class="popup-info-item">
            <span class="info-label">⚠️ Önem:</span>
            <span class="info-value severity-${alert.severity?.toLowerCase()}">${alert.severity}</span>
          </div>
          <div class="popup-info-item">
            <span class="info-label">💬 Mesaj:</span>
            <span class="info-value">${alert.message}</span>
          </div>
          <div class="popup-info-item">
            <span class="info-label">📐 Koordinatlar:</span>
            <span class="info-value">${alert.latitude.toFixed(6)}, ${alert.longitude.toFixed(6)}</span>
          </div>
          <div class="popup-info-item">
            <span class="info-label">🕒 Zaman:</span>
            <span class="info-value">${this.formatTimestamp(alert.timestamp)}</span>
          </div>
        </div>
      </div>
    `;
  }

  private createUserLocationPopup(location: any): string {
    return `
      <div class="entity-popup user-popup">
        <div class="popup-header user-header">
          <div class="popup-icon">👤</div>
          <div class="popup-title">
            <h4>${location.username}</h4>
            <span class="popup-subtitle">Kullanıcı Konumu</span>
          </div>
        </div>
        <div class="popup-content">
          <div class="popup-info-item">
            <span class="info-label">📱 Durum:</span>
            <span class="info-value status-${location.status?.toLowerCase()}">${location.status}</span>
          </div>
          <div class="popup-info-item">
            <span class="info-label">📐 Koordinatlar:</span>
            <span class="info-value">${location.latitude.toFixed(6)}, ${location.longitude.toFixed(6)}</span>
          </div>
          <div class="popup-info-item">
            <span class="info-label">🕒 Zaman:</span>
            <span class="info-value">${this.formatTimestamp(location.timestamp)}</span>
          </div>
        </div>
      </div>
    `;
  }

  private getSafezoneTypeLabel(zoneType: string): string {
    const labels: { [key: string]: string } = {
      'TOPLANMA_ALANI': 'Toplanma Alanı',
      'YARDIM_DAGITIM': 'Yardım Dağıtım'
    };
    return labels[zoneType] || zoneType;
  }

  toggleEntityType(type: MapEntity['type']): void {
    if (this.showOnlySafezones) {
      // If showing only safezones, don't allow toggling
      return;
    }
    
    const index = this._visibleEntityTypes.indexOf(type);
    if (index > -1) {
      this._visibleEntityTypes.splice(index, 1);
    } else {
      this._visibleEntityTypes.push(type);
    }
    this.updateMapMarkers();
    
    // Change detection'ı manuel olarak tetikle
    this.cdr.detectChanges();
  }

  centerMap(): void {
    if (this.showOnlySafezones) {
      // If showing only safezones, focus on safezone entities
      const safezoneEntities = this.mapEntities.filter(entity => entity.type === 'SAFE_ZONE');
      if (this.map && safezoneEntities.length > 0) {
        const bounds = L.latLngBounds(
          safezoneEntities.map(entity => [entity.latitude, entity.longitude])
        );
        this.map.fitBounds(bounds, { padding: [20, 20] });
      } else {
        // Türkiye'yi göster
        this.map.setView([39.9334, 32.8597], 6);
      }
    } else {
      if (this.map && this.mapEntities.length > 0) {
        const bounds = L.latLngBounds(
          this.mapEntities.map(entity => [entity.latitude, entity.longitude])
        );
        this.map.fitBounds(bounds, { padding: [20, 20] });
      } else {
        // Türkiye'yi göster
        this.map.setView([39.9334, 32.8597], 6);
      }
    }
    
    // Change detection'ı manuel olarak tetikle
    this.cdr.detectChanges();
  }

  connect(): void {
    console.log('WebSocket bağlantısı başlatılıyor...');
    this.mapWebSocketService.connect();
    this.notificationWebSocketService.connect();
    console.log('WebSocket bağlantı istekleri gönderildi');
    
    // Change detection'ı manuel olarak tetikle
    this.cdr.detectChanges();
  }

  disconnect(): void {
    this.mapWebSocketService.disconnect();
    this.notificationWebSocketService.disconnect();
    
    // Change detection'ı manuel olarak tetikle
    this.cdr.detectChanges();
  }

  clearAllEntities(): void {
    if (this.showOnlySafezones) {
      // If showing only safezones, only clear safezone markers
      this.markers.forEach((marker, key) => {
        if (key.startsWith('SAFE_ZONE_')) {
          marker.remove();
          this.markers.delete(key);
        }
      });
    } else {
      this.mapWebSocketService.clearAllMapEntities();
      this.markers.forEach(marker => marker.remove());
      this.markers.clear();
    }
    
    // Change detection'ı manuel olarak tetikle
    this.cdr.detectChanges();
  }

  testHelpRequest(): void {
    const testUpdate = {
      eventType: 'CREATED' as const,
      entityType: 'HELP_REQUEST',
      payload: {
        id: Date.now(),
        title: 'Test Help Request',
        latitude: 39.9334 + (Math.random() - 0.5) * 0.1,
        longitude: 32.8597 + (Math.random() - 0.5) * 0.1,
        description: 'Test description',
        timestamp: Date.now()
      }
    };
    this.mapWebSocketService['webSocketService'].sendMapUpdate(testUpdate);
    this.cdr.detectChanges();
  }

  testSafezone(): void {
    const testUpdate = {
      eventType: 'CREATED' as const,
      entityType: 'SAFE_ZONE',
      payload: {
        id: Date.now(),
        name: 'Test Safezone',
        latitude: 39.9334 + (Math.random() - 0.5) * 0.1,
        longitude: 32.8597 + (Math.random() - 0.5) * 0.1,
        zone_type: 'TOPLANMA_ALANI',
        timestamp: Date.now()
      }
    };
    this.mapWebSocketService['webSocketService'].sendMapUpdate(testUpdate);
    this.cdr.detectChanges();
  }

  testAssignment(): void {
    const testUpdate = {
      eventType: 'CREATED' as const,
      entityType: 'ASSIGNMENT',
      payload: {
        id: Date.now(),
        title: 'Test Assignment',
        latitude: 39.9334 + (Math.random() - 0.5) * 0.1,
        longitude: 32.8597 + (Math.random() - 0.5) * 0.1,
        description: 'Test assignment description',
        timestamp: Date.now()
      }
    };
    this.mapWebSocketService['webSocketService'].sendMapUpdate(testUpdate);
    this.cdr.detectChanges();
  }

  testEmergencyAlert(): void {
    const testUpdate = {
      eventType: 'CREATED' as const,
      entityType: 'EMERGENCY_ALERT',
      payload: {
        id: Date.now(),
        title: 'Test Emergency Alert',
        latitude: 39.9334 + (Math.random() - 0.5) * 0.1,
        longitude: 32.8597 + (Math.random() - 0.5) * 0.1,
        message: 'Test emergency message',
        severity: 'HIGH',
        timestamp: Date.now()
      }
    };
    this.mapWebSocketService['webSocketService'].sendMapUpdate(testUpdate);
    this.cdr.detectChanges();
  }

  testUserLocation(): void {
    const testUpdate = {
      eventType: 'CREATED' as const,
      entityType: 'USER_LOCATION',
      payload: {
        id: Date.now(),
        userId: 'test_user_' + Date.now(),
        username: 'Test User',
        latitude: 39.9334 + (Math.random() - 0.5) * 0.1,
        longitude: 32.8597 + (Math.random() - 0.5) * 0.1,
        status: 'ONLINE',
        timestamp: Date.now()
      }
    };
    this.mapWebSocketService['webSocketService'].sendMapUpdate(testUpdate);
    this.cdr.detectChanges();
  }

  testAllEntities(): void {
    this.testHelpRequest();
    this.testSafezone();
    this.testAssignment();
    this.testEmergencyAlert();
    this.testUserLocation();
    this.cdr.detectChanges();
  }

  testMultipleSafezones(): void {
    for (let i = 0; i < 3; i++) {
      const testUpdate = {
        eventType: 'CREATED' as const,
        entityType: 'SAFE_ZONE',
        payload: {
          id: Date.now() + i,
          name: `Test Güvenli Bölge ${i + 1}`,
          latitude: 39.9334 + (Math.random() - 0.5) * 0.1,
          longitude: 32.8597 + (Math.random() - 0.5) * 0.1,
          zone_type: 'TOPLANMA_ALANI',
          timestamp: Date.now() + i
        }
      };
      this.mapWebSocketService['webSocketService'].sendMapUpdate(testUpdate);
    }
    this.cdr.detectChanges();
  }

  getEntityCountByType(type: MapEntity['type']): number {
    if (this.showOnlySafezones && type !== 'SAFE_ZONE') {
      return 0;
    }
    return this.mapEntities.filter(entity => entity.type === type).length;
  }

  getEntityTypeLabel(type: MapEntity['type']): string {
    if (this.showOnlySafezones && type !== 'SAFE_ZONE') {
      return 'Güvenli Bölge';
    }
    
    const labels: Record<MapEntity['type'], string> = {
      'HELP_REQUEST': 'Yardım Talebi',
      'SAFE_ZONE': 'Güvenli Bölge',
      'ASSIGNMENT': 'Görev',
      'EMERGENCY_ALERT': 'Acil Durum',
      'USER_LOCATION': 'Kullanıcı Konumu'
    };
    return labels[type] || type;
  }

  formatTimestamp(timestamp: number): string {
    return new Date(timestamp).toLocaleString('tr-TR');
  }

  private getEntityTypeIcon(type: string): string {
    const icons: { [key: string]: string } = {
      'HELP_REQUEST': '🆘',
      'SAFE_ZONE': '🛡️',
      'ASSIGNMENT': '📋',
      'EMERGENCY_ALERT': '🚨',
      'USER_LOCATION': '👤'
    };
    return icons[type] || '📍';
  }

  private loadSampleData(): void {
    console.log('🔄 Örnek veriler yükleniyor...');
    
    // Örnek verileri yüklemek için birkaç saniye bekleyin
    setTimeout(() => {
      console.log('✅ Örnek veriler yükleniyor...');
      
      // Türkiye'nin farklı bölgelerinde örnek veriler
      this.createSampleHelpRequests();
      this.createSampleSafezones();
      this.createSampleAssignments();
      this.createSampleEmergencyAlerts();
      this.createSampleUserLocations();
      
      console.log('✅ Tüm örnek veriler yüklendi');
      this.sampleDataLoaded = true;
      this.cdr.detectChanges(); // Change detection'ı tetikle
    }, 2000); // 2 saniye bekle
  }

  private createSampleHelpRequests(): void {
    const helpRequests = [
      {
        id: 1001,
        title: 'Deprem Sonrası Yardım Talebi',
        latitude: 37.0662, // Antakya
        longitude: 36.3783,
        description: 'Bina yıkıntısı altında kalanlar için acil yardım gerekli',
        timestamp: Date.now() - 1000 * 60 * 30 // 30 dakika önce
      },
      {
        id: 1002,
        title: 'Sel Bölgesi Yardım Talebi',
        latitude: 40.9862, // Trabzon
        longitude: 39.7224,
        description: 'Sel suları nedeniyle mahsur kalan aileler için yardım',
        timestamp: Date.now() - 1000 * 60 * 45 // 45 dakika önce
      },
      {
        id: 1003,
        title: 'Orman Yangını Yardım Talebi',
        latitude: 38.4192, // Muğla
        longitude: 27.1287,
        description: 'Orman yangını nedeniyle tahliye edilen köyler için yardım',
        timestamp: Date.now() - 1000 * 60 * 60 // 1 saat önce
      }
    ];

    helpRequests.forEach(request => {
      const testUpdate = {
        eventType: 'CREATED' as const,
        entityType: 'HELP_REQUEST',
        payload: request
      };
      this.mapWebSocketService['webSocketService'].sendMapUpdate(testUpdate);
    });
  }

  private createSampleSafezones(): void {
    const safezones = [
      {
        id: 2001,
        name: 'Antakya Toplanma Alanı',
        latitude: 36.2023,
        longitude: 36.1613,
        zone_type: 'TOPLANMA_ALANI',
        timestamp: Date.now() - 1000 * 60 * 120 // 2 saat önce
      },
      {
        id: 2002,
        name: 'İstanbul Güvenli Bölge',
        latitude: 41.0082,
        longitude: 28.9784,
        zone_type: 'YARDIM_DAGITIM',
        timestamp: Date.now() - 1000 * 60 * 90 // 1.5 saat önce
      },
      {
        id: 2003,
        name: 'Ankara Toplanma Merkezi',
        latitude: 39.9334,
        longitude: 32.8597,
        zone_type: 'TOPLANMA_ALANI',
        timestamp: Date.now() - 1000 * 60 * 180 // 3 saat önce
      },
      {
        id: 2004,
        name: 'İzmir Yardım Merkezi',
        latitude: 38.4192,
        longitude: 27.1287,
        zone_type: 'YARDIM_DAGITIM',
        timestamp: Date.now() - 1000 * 60 * 150 // 2.5 saat önce
      },
      {
        id: 2005,
        name: 'Adana Güvenli Bölge',
        latitude: 37.0000,
        longitude: 35.3213,
        zone_type: 'TOPLANMA_ALANI',
        timestamp: Date.now() - 1000 * 60 * 200 // 3.5 saat önce
      }
    ];

    safezones.forEach(zone => {
      const testUpdate = {
        eventType: 'CREATED' as const,
        entityType: 'SAFE_ZONE',
        payload: zone
      };
      this.mapWebSocketService['webSocketService'].sendMapUpdate(testUpdate);
    });
  }

  private createSampleAssignments(): void {
    const assignments = [
      {
        id: 3001,
        title: 'Arama Kurtarma Görevi',
        latitude: 37.0662,
        longitude: 36.3783,
        description: 'Deprem bölgesinde arama kurtarma operasyonu',
        timestamp: Date.now() - 1000 * 60 * 20 // 20 dakika önce
      },
      {
        id: 3002,
        title: 'Tıbbi Yardım Görevi',
        latitude: 40.9862,
        longitude: 39.7224,
        description: 'Sel bölgesinde tıbbi yardım ve ilk müdahale',
        timestamp: Date.now() - 1000 * 60 * 35 // 35 dakika önce
      },
      {
        id: 3003,
        title: 'Yangın Söndürme Görevi',
        latitude: 38.4192,
        longitude: 27.1287,
        description: 'Orman yangını söndürme operasyonu',
        timestamp: Date.now() - 1000 * 60 * 50 // 50 dakika önce
      }
    ];

    assignments.forEach(assignment => {
      const testUpdate = {
        eventType: 'CREATED' as const,
        entityType: 'ASSIGNMENT',
        payload: assignment
      };
      this.mapWebSocketService['webSocketService'].sendMapUpdate(testUpdate);
    });
  }

  private createSampleEmergencyAlerts(): void {
    const alerts = [
      {
        id: 4001,
        title: 'Deprem Uyarısı',
        latitude: 37.0662,
        longitude: 36.3783,
        message: '6.8 büyüklüğünde deprem meydana geldi',
        severity: 'HIGH',
        timestamp: Date.now() - 1000 * 60 * 10 // 10 dakika önce
      },
      {
        id: 4002,
        title: 'Sel Uyarısı',
        latitude: 40.9862,
        longitude: 39.7224,
        message: 'Şiddetli yağış nedeniyle sel riski',
        severity: 'MEDIUM',
        timestamp: Date.now() - 1000 * 60 * 25 // 25 dakika önce
      },
      {
        id: 4003,
        title: 'Yangın Uyarısı',
        latitude: 38.4192,
        longitude: 27.1287,
        message: 'Orman yangını riski yüksek',
        severity: 'HIGH',
        timestamp: Date.now() - 1000 * 60 * 40 // 40 dakika önce
      }
    ];

    alerts.forEach(alert => {
      const testUpdate = {
        eventType: 'CREATED' as const,
        entityType: 'EMERGENCY_ALERT',
        payload: alert
      };
      this.mapWebSocketService['webSocketService'].sendMapUpdate(testUpdate);
    });
  }

  private createSampleUserLocations(): void {
    const users = [
      {
        id: 5001,
        userId: 'user_001',
        username: 'Ahmet Yılmaz',
        latitude: 37.0662,
        longitude: 36.3783,
        status: 'ONLINE',
        timestamp: Date.now() - 1000 * 60 * 5 // 5 dakika önce
      },
      {
        id: 5002,
        userId: 'user_002',
        username: 'Fatma Demir',
        latitude: 40.9862,
        longitude: 39.7224,
        status: 'BUSY',
        timestamp: Date.now() - 1000 * 60 * 15 // 15 dakika önce
      },
      {
        id: 5003,
        userId: 'user_003',
        username: 'Mehmet Kaya',
        latitude: 38.4192,
        longitude: 27.1287,
        status: 'ONLINE',
        timestamp: Date.now() - 1000 * 60 * 30 // 30 dakika önce
      },
      {
        id: 5004,
        userId: 'user_004',
        username: 'Ayşe Özkan',
        latitude: 39.9334,
        longitude: 32.8597,
        status: 'OFFLINE',
        timestamp: Date.now() - 1000 * 60 * 60 // 1 saat önce
      }
    ];

    users.forEach(user => {
      const testUpdate = {
        eventType: 'CREATED' as const,
        entityType: 'USER_LOCATION',
        payload: user
      };
      this.mapWebSocketService['webSocketService'].sendMapUpdate(testUpdate);
    });
  }

  // İstanbul deprem simülasyonu - 150+ veri
  simulateIstanbulEarthquake(): void {
    console.log('🌋 İstanbul Deprem Simülasyonu Başlatılıyor...');
    console.log('📊 150+ veri girişi simüle ediliyor...');
    
    // Simülasyon durumunu güncelle
    this.isSimulating = true;
    this.cdr.detectChanges();
    
    // Deprem merkezi: İstanbul (41.0082, 28.9784)
    const earthquakeCenter = { lat: 41.0082, lng: 28.9784 };
    
    // 1. Acil Durum Uyarısı (Deprem)
    this.createEarthquakeAlert(earthquakeCenter);
    
    // 2. Yardım Talepleri (50+ adet)
    this.createMassiveHelpRequests(earthquakeCenter, 50);
    
    // 3. Güvenli Bölgeler (30+ adet)
    this.createEmergencySafezones(earthquakeCenter, 30);
    
    // 4. Acil Görevler (40+ adet)
    this.createEmergencyAssignments(earthquakeCenter, 40);
    
    // 5. Kullanıcı Konumları (30+ adet)
    this.createEmergencyUserLocations(earthquakeCenter, 30);
    
    // Simülasyon tamamlandığında
    setTimeout(() => {
      this.isSimulating = false;
      this.cdr.detectChanges();
      console.log('✅ İstanbul Deprem Simülasyonu Tamamlandı!');
      console.log(`📊 Toplam ${this.mapEntities.length} veri oluşturuldu`);
    }, 5000); // 5 saniye sonra tamamlandı olarak işaretle
  }

  private createEarthquakeAlert(center: { lat: number, lng: number }): void {
    const alert = {
      id: 9999,
      title: '🚨 BÜYÜK DEPREM - İSTANBUL',
      latitude: center.lat,
      longitude: center.lng,
      message: '7.2 büyüklüğünde deprem meydana geldi. Acil durum planı devreye alındı.',
      severity: 'CRITICAL',
      timestamp: Date.now()
    };

    const testUpdate = {
      eventType: 'CREATED' as const,
      entityType: 'EMERGENCY_ALERT',
      payload: alert
    };
    this.mapWebSocketService['webSocketService'].sendMapUpdate(testUpdate);
  }

  private createMassiveHelpRequests(center: { lat: number, lng: number }, count: number): void {
    const helpRequestTypes = [
      'Bina yıkıntısı altında kalanlar',
      'Yaralılar için acil yardım',
      'Mahsur kalan aileler',
      'İlaç ve tıbbi malzeme ihtiyacı',
      'Su ve gıda yardımı',
      'Elektrik kesintisi nedeniyle yardım',
      'İletişim kesintisi nedeniyle yardım',
      'Ulaşım engeli nedeniyle yardım',
      'Barınma ihtiyacı',
      'Psikolojik destek ihtiyacı'
    ];

    const districts = [
      'Kadıköy', 'Beşiktaş', 'Şişli', 'Beyoğlu', 'Fatih', 'Üsküdar', 'Maltepe', 'Ataşehir',
      'Kartal', 'Pendik', 'Tuzla', 'Sultanbeyli', 'Sancaktepe', 'Çekmeköy', 'Ümraniye',
      'Beykoz', 'Çatalca', 'Silivri', 'Büyükçekmece', 'Küçükçekmece', 'Avcılar', 'Esenyurt'
    ];

    for (let i = 0; i < count; i++) {
      // Merkez etrafında rastgele konum (0.1 derece yarıçap)
      const lat = center.lat + (Math.random() - 0.5) * 0.1;
      const lng = center.lng + (Math.random() - 0.5) * 0.1;
      
      const request = {
        id: 10000 + i,
        title: `${districts[i % districts.length]} - ${helpRequestTypes[i % helpRequestTypes.length]}`,
        latitude: lat,
        longitude: lng,
        description: `${helpRequestTypes[i % helpRequestTypes.length]} için acil yardım talebi. Deprem sonrası oluşan durum.`,
        timestamp: Date.now() - Math.random() * 1000 * 60 * 60 // Son 1 saat içinde
      };

      const testUpdate = {
        eventType: 'CREATED' as const,
        entityType: 'HELP_REQUEST',
        payload: request
      };
      
      // Her 100ms'de bir veri gönder (yoğun trafik simülasyonu)
      setTimeout(() => {
        this.mapWebSocketService['webSocketService'].sendMapUpdate(testUpdate);
      }, i * 100);
    }
  }

  private createEmergencySafezones(center: { lat: number, lng: number }, count: number): void {
    const safezoneTypes = [
      'TOPLANMA_ALANI',
      'YARDIM_DAGITIM',
      'ACIL_DURUM_MERKEZI',
      'TIBBI_YARDIM_MERKEZI',
      'BARINMA_MERKEZI',
      'İLETİŞİM_MERKEZI',
      'ULAŞIM_MERKEZI',
      'LOJİSTİK_MERKEZI'
    ];

    const safezoneNames = [
      'Kadıköy Acil Durum Merkezi', 'Beşiktaş Toplanma Alanı', 'Şişli Yardım Merkezi',
      'Beyoğlu Güvenli Bölge', 'Fatih Acil Durum Merkezi', 'Üsküdar Toplanma Alanı',
      'Maltepe Yardım Merkezi', 'Ataşehir Güvenli Bölge', 'Kartal Acil Durum Merkezi',
      'Pendik Toplanma Alanı', 'Tuzla Yardım Merkezi', 'Sultanbeyli Güvenli Bölge'
    ];

    for (let i = 0; i < count; i++) {
      const lat = center.lat + (Math.random() - 0.5) * 0.15;
      const lng = center.lng + (Math.random() - 0.5) * 0.15;
      
      const safezone = {
        id: 20000 + i,
        name: safezoneNames[i % safezoneNames.length] + ` #${i + 1}`,
        latitude: lat,
        longitude: lng,
        zone_type: safezoneTypes[i % safezoneTypes.length],
        timestamp: Date.now() - Math.random() * 1000 * 60 * 120 // Son 2 saat içinde
      };

      const testUpdate = {
        eventType: 'CREATED' as const,
        entityType: 'SAFE_ZONE',
        payload: safezone
      };
      
      setTimeout(() => {
        this.mapWebSocketService['webSocketService'].sendMapUpdate(testUpdate);
      }, i * 150);
    }
  }

  private createEmergencyAssignments(center: { lat: number, lng: number }, count: number): void {
    const assignmentTypes = [
      'Arama Kurtarma',
      'Tıbbi Yardım',
      'Yangın Söndürme',
      'İletişim Kurma',
      'Ulaşım Sağlama',
      'Barınma Kurma',
      'Gıda Dağıtımı',
      'Su Temini',
      'Elektrik Onarımı',
      'Güvenlik Sağlama'
    ];

    const priorities = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'];

    for (let i = 0; i < count; i++) {
      const lat = center.lat + (Math.random() - 0.5) * 0.12;
      const lng = center.lng + (Math.random() - 0.5) * 0.12;
      
      const assignment = {
        id: 30000 + i,
        title: `${assignmentTypes[i % assignmentTypes.length]} Görevi #${i + 1}`,
        latitude: lat,
        longitude: lng,
        description: `Deprem sonrası ${assignmentTypes[i % assignmentTypes.length]} için acil görev. Öncelik: ${priorities[i % priorities.length]}`,
        priority: priorities[i % priorities.length],
        timestamp: Date.now() - Math.random() * 1000 * 60 * 90 // Son 1.5 saat içinde
      };

      const testUpdate = {
        eventType: 'CREATED' as const,
        entityType: 'ASSIGNMENT',
        payload: assignment
      };
      
      setTimeout(() => {
        this.mapWebSocketService['webSocketService'].sendMapUpdate(testUpdate);
      }, i * 120);
    }
  }

  private createEmergencyUserLocations(center: { lat: number, lng: number }, count: number): void {
    const userNames = [
      'Ahmet Yılmaz', 'Fatma Demir', 'Mehmet Kaya', 'Ayşe Özkan', 'Ali Çelik',
      'Zeynep Arslan', 'Mustafa Öz', 'Elif Yıldız', 'Hasan Korkmaz', 'Selin Demir',
      'Burak Şahin', 'Deniz Öztürk', 'Ceren Yılmaz', 'Emre Kaya', 'Sude Arslan',
      'Can Özkan', 'Merve Çelik', 'Onur Demir', 'Gizem Yıldız', 'Kaan Korkmaz'
    ];

    const statuses = ['ONLINE', 'BUSY', 'OFFLINE', 'EMERGENCY'];

    for (let i = 0; i < count; i++) {
      const lat = center.lat + (Math.random() - 0.5) * 0.08;
      const lng = center.lng + (Math.random() - 0.5) * 0.08;
      
      const user = {
        id: 50000 + i,
        userId: `emergency_user_${i + 1}`,
        username: userNames[i % userNames.length] + ` (${i + 1})`,
        latitude: lat,
        longitude: lng,
        status: statuses[i % statuses.length],
        timestamp: Date.now() - Math.random() * 1000 * 60 * 30 // Son 30 dakika içinde
      };

      const testUpdate = {
        eventType: 'CREATED' as const,
        entityType: 'USER_LOCATION',
        payload: user
      };
      
      setTimeout(() => {
        this.mapWebSocketService['webSocketService'].sendMapUpdate(testUpdate);
      }, i * 80);
    }
  }
}
