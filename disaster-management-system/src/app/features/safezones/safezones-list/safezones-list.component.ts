import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { SafezonesService } from '../../../core/services/safezones.service';
import { Safezone, ZoneType } from '../../../core/models/safezone.model';
import { Location } from '../../../core/models/location.model';
import { AuthService } from '../../../core/services/auth.service';
import { User, UserRole } from '../../../core/models/user.model';
import { WebSocketService, SafezoneUpdate } from '../../../core/services/websocket.service';
import { Subscription } from 'rxjs';
import { RealTimeMapComponent } from '../../../shared/components/real-time-map.component';
import { MapWebSocketService, MapEntity } from '../../../core/services/map-websocket.service';

@Component({
  selector: 'app-safezones-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, RealTimeMapComponent],
  template: `
    <div class="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100">
      <!-- Header -->
      <header class="bg-white shadow-sm border-b border-gray-200">
        <div class="container-responsive">
          <div class="flex flex-col sm:flex-row sm:justify-between sm:items-center py-4 sm:py-6 space-y-4 sm:space-y-0">
            <div>
              <h1 class="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900">Güvenli Bölgeler</h1>
              <p class="text-gray-600 mt-1">Güvenli bölgeleri görüntüle ve harita üzerinde takip et</p>
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
              
              @if (isAdmin()) {
                <button 
                  routerLink="/safezones/create"
                  class="btn-primary text-sm px-4 py-2.5"
                >
                  <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Yeni Bölge Ekle
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
              <div class="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <div class="ml-4">
                <p class="text-sm font-medium text-gray-600">Toplam Bölge</p>
                <p class="text-2xl font-bold text-gray-900">{{ safezones.length }}</p>
              </div>
            </div>
          </div>

          <div class="card p-4">
            <div class="flex items-center">
              <div class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div class="ml-4">
                <p class="text-sm font-medium text-gray-600">Toplanma Alanı</p>
                <p class="text-2xl font-bold text-gray-900">{{ getSafezonesByType(ZoneType.TOPLANMA_ALANI).length }}</p>
              </div>
            </div>
          </div>

          <div class="card p-4">
            <div class="flex items-center">
              <div class="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <svg class="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <div class="ml-4">
                <p class="text-sm font-medium text-gray-600">Yardım Dağıtım</p>
                <p class="text-2xl font-bold text-gray-900">{{ getSafezonesByType(ZoneType.YARDIM_DAGITIM).length }}</p>
              </div>
            </div>
          </div>

          <div class="card p-4">
            <div class="flex items-center">
              <div class="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <svg class="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div class="ml-4">
                <p class="text-sm font-medium text-gray-600">Toplam Kapasite</p>
                <p class="text-2xl font-bold text-gray-900">{{ getTotalCapacity() }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Map Section -->
        <div class="card p-4 sm:p-6 mb-6">
          <div class="flex justify-between items-center mb-4">
            <h3 class="text-lg font-semibold text-gray-900">Canlı Harita</h3>
            <div class="flex items-center space-x-2">
              <button 
                (click)="toggleMapView()"
                class="btn-outline text-sm px-3 py-2"
              >
                {{ isMapView ? 'Liste Görünümü' : 'Harita Görünümü' }}
              </button>
            </div>
          </div>
          
          <!-- Map Container -->
          <div class="relative">
            @if (isMapView) {
              <app-real-time-map [showOnlySafezones]="true"></app-real-time-map>
            } @else {
              <!-- List View -->
              <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                @for (safezone of safezones; track safezone.id) {
                  <div class="border rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div class="flex items-start justify-between mb-2">
                      <h4 class="font-medium text-gray-900">{{ safezone.name }}</h4>
                      <span class="text-xs px-2 py-1 rounded-full"
                            [ngClass]="{
                              'bg-blue-100 text-blue-800': safezone.zone_type === ZoneType.TOPLANMA_ALANI,
                              'bg-green-100 text-green-800': safezone.zone_type === ZoneType.YARDIM_DAGITIM
                            }">
                        {{ getZoneTypeLabel(safezone.zone_type) }}
                      </span>
                    </div>
                    <p class="text-sm text-gray-600 mb-2">
                      <span class="font-medium">Konum:</span> {{ safezone.location_id ? getLocationName(safezone.location_id) : 'Konum belirtilmemiş' }}
                    </p>
                    <p class="text-sm text-gray-600 mb-2">
                      <span class="font-medium">Oluşturulma:</span> {{ safezone.created_at | date:'dd/MM/yyyy HH:mm' }}
                    </p>
                    <div class="flex justify-between items-center">
                      <button 
                        [routerLink]="['/safezones', safezone.id]"
                        class="btn-outline text-xs px-3 py-1"
                      >
                        Detayları Gör
                      </button>
                      <button 
                        (click)="safezone.location_id ? centerMapOnLocation(safezone.location_id) : null"
                        [disabled]="!safezone.location_id"
                        class="text-blue-600 hover:text-blue-800 text-xs disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Haritada Göster
                      </button>
                    </div>
                  </div>
                }
              </div>
            }
          </div>
        </div>

        <!-- Filters -->
        <div class="card p-4 sm:p-6 mb-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">Filtreler</h3>
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div class="form-group">
              <label class="form-label">Bölge Türü</label>
              <select 
                [(ngModel)]="selectedZoneType" 
                (change)="filterSafezones()"
                class="form-input"
              >
                <option value="">Tüm Türler</option>
                <option [value]="ZoneType.TOPLANMA_ALANI">Toplanma Alanı</option>
                <option [value]="ZoneType.YARDIM_DAGITIM">Yardım Dağıtım</option>
              </select>
            </div>

            <div class="form-group">
              <label class="form-label">Sıralama</label>
              <select 
                [(ngModel)]="sortBy" 
                (change)="sortSafezones()"
                class="form-input"
              >
                <option value="name">İsim</option>
                <option value="created_at">Oluşturulma Tarihi</option>
                <option value="zone_type">Bölge Türü</option>
              </select>
            </div>

            <div class="form-group">
              <label class="form-label">Arama</label>
              <input 
                type="text" 
                [(ngModel)]="searchTerm" 
                (input)="filterSafezones()"
                placeholder="Bölge adı ara..."
                class="form-input"
              >
            </div>
          </div>

          <!-- Active Filters Display -->
          @if (hasActiveFilters()) {
            <div class="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <div class="flex flex-wrap items-center gap-2">
                <span class="text-sm font-medium text-blue-800">Aktif Filtreler:</span>
                @if (selectedZoneType) {
                  <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    Tür: {{ getZoneTypeLabel(selectedZoneType) }}
                    <button (click)="clearZoneTypeFilter()" class="ml-1 text-blue-600 hover:text-blue-800">×</button>
                  </span>
                }
                @if (searchTerm) {
                  <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Arama: "{{ searchTerm }}"
                    <button (click)="clearSearchFilter()" class="ml-1 text-green-600 hover:text-green-800">×</button>
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
              <span class="font-semibold text-gray-900">{{ filteredSafezones.length }}</span> güvenli bölge bulundu
              @if (selectedZoneType || searchTerm) {
                <span class="text-sm text-gray-500">
                  (filtrelenmiş)
                </span>
              }
            </p>
          </div>
          
          <div class="flex items-center space-x-3">
            @if (selectedZoneType || searchTerm) {
              <button 
                (click)="clearFilters()"
                class="btn-secondary text-sm px-3 py-2"
              >
                Filtreleri Temizle
              </button>
            }
          </div>
        </div>

        <!-- Safezones Grid -->
        @if (filteredSafezones.length > 0) {
          <div class="grid-responsive-2 xl:grid-cols-3 gap-4 sm:gap-6">
            @for (safezone of filteredSafezones; track safezone.id) {
              <div class="card-hover p-6">
                <!-- Safezone Header -->
                <div class="flex justify-between items-start mb-4">
                  <div class="flex items-center space-x-3">
                    <div class="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                      <svg class="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                    <div>
                      <h3 class="font-semibold text-gray-900">{{ safezone.name }}</h3>
                      <p class="text-sm text-gray-500">{{ safezone.created_at | date:'short' }}</p>
                    </div>
                  </div>
                  
                  <span class="status-badge"
                        [ngClass]="{
                          'status-toplanma': safezone.zone_type === ZoneType.TOPLANMA_ALANI,
                          'status-yardim': safezone.zone_type === ZoneType.YARDIM_DAGITIM
                        }">
                    {{ getZoneTypeLabel(safezone.zone_type) }}
                  </span>
                </div>

                <!-- Safezone Details -->
                <div class="mb-4">
                  <p class="text-sm text-gray-600 mb-2">
                    <span class="font-medium">Konum:</span> {{ safezone.location_id ? getLocationName(safezone.location_id) : 'Konum belirtilmemiş' }}
                  </p>
                  
                  @if (safezone.added_by_admin_id) {
                    <p class="text-sm text-gray-600 mb-2">
                      <span class="font-medium">Ekleyen Admin:</span> {{ safezone.added_by_admin_id }}
                    </p>
                  }
                </div>

                <!-- Safezone Footer -->
                <div class="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-3 sm:space-y-0">
                  <div class="text-sm text-gray-500">
                    <span class="font-medium">Oluşturulma:</span> {{ safezone.created_at | date:'dd/MM/yyyy HH:mm' }}
                  </div>
                  
                  <div class="flex space-x-2">
                    <button 
                      [routerLink]="['/safezones', safezone.id]"
                      class="btn-outline text-sm px-3 py-2"
                    >
                      Detayları Gör
                    </button>
                    
                    <button 
                      (click)="safezone.location_id ? centerMapOnLocation(safezone.location_id) : null"
                      [disabled]="!safezone.location_id"
                      class="btn-secondary text-sm px-3 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Haritada Göster
                    </button>
                  </div>
                </div>
              </div>
            }
          </div>
        }

        <!-- Empty State -->
        @if (filteredSafezones.length === 0) {
          <div class="text-center py-12">
            <div class="w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
              <svg class="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <h3 class="text-lg font-medium text-gray-900 mb-2">Güvenli bölge bulunamadı</h3>
            <p class="text-gray-600 mb-6">
              {{ selectedZoneType || searchTerm 
                 ? 'Seçilen filtrelere uygun güvenli bölge bulunamadı. Filtreleri değiştirmeyi deneyin.' 
                 : 'Henüz güvenli bölge eklenmemiş.' }}
            </p>
            @if (isAdmin()) {
              <button 
                routerLink="/safezones/create"
                class="btn-primary"
              >
                İlk Güvenli Bölgeyi Ekle
              </button>
            }
          </div>
        }

        <!-- Loading State -->
        @if (isLoading) {
          <div class="text-center py-12">
            <div class="w-16 h-16 mx-auto mb-4 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
            <p class="text-gray-600">Güvenli bölgeler yükleniyor...</p>
          </div>
        }
      </main>
    </div>
  `,
  styles: [`
    .status-badge {
      @apply px-2 py-1 text-xs font-medium rounded-full;
    }
    
    .status-toplanma {
      @apply bg-blue-100 text-blue-800;
    }
    
    .status-yardim {
      @apply bg-green-100 text-green-800;
    }
  `]
})
export class SafezonesListComponent implements OnInit, OnDestroy {
  @ViewChild('mapContainer', { static: false }) mapContainer!: ElementRef;
  
  safezones: Safezone[] = [];
  filteredSafezones: Safezone[] = [];
  locations: Location[] = [];
  isLoading = false;
  isWebSocketConnected = false;
  isMapView = true;
  
  // Filters
  selectedZoneType: ZoneType | '' = '';
  searchTerm = '';
  
  // Sorting
  sortBy = 'name';
  
  // Enums
  ZoneType = ZoneType;
  
  // Subscriptions
  private webSocketSubscriptions: Subscription[] = [];

  constructor(
    private safezonesService: SafezonesService,
    private authService: AuthService,
    private webSocketService: WebSocketService,
    private router: Router,
    private mapWebSocketService: MapWebSocketService
  ) {}

  ngOnInit(): void {
    this.loadSafezones();
    this.loadLocations();
    this.setupWebSocket();
  }

  ngOnDestroy(): void {
    this.webSocketSubscriptions.forEach(sub => sub.unsubscribe());
  }

  setupWebSocket(): void {
    this.webSocketService.connect();
    
    const connectionSub = this.webSocketService.isConnected$.subscribe(
      connected => this.isWebSocketConnected = connected
    );
    
    const safezoneUpdatesSub = this.webSocketService.safezoneUpdates$.subscribe(
      update => this.handleSafezoneUpdate(update)
    );
    
    this.webSocketSubscriptions.push(connectionSub, safezoneUpdatesSub);
  }

  handleSafezoneUpdate(update: SafezoneUpdate): void {
    // Update the safezone in the local array
    const index = this.safezones.findIndex(s => s.id === update.id);
    if (index !== -1) {
      // Only update compatible properties
      const currentSafezone = this.safezones[index];
      this.safezones[index] = {
        ...currentSafezone,
        name: update.name || currentSafezone.name,
        // Don't update zone_type as it's an enum
        // Don't update other incompatible properties
      };
      this.filterSafezones();
    }
  }

  loadSafezones(): void {
    this.isLoading = true;
    this.safezonesService.getSafezones().subscribe({
      next: (safezones) => {
        this.safezones = safezones;
        this.filteredSafezones = safezones;
        this.isLoading = false;
        
        // Safezone'ları haritaya ekle
        this.addSafezonesToMap(safezones);
      },
      error: (error) => {
        console.error('Güvenli bölgeler yüklenirken hata oluştu:', error);
        this.isLoading = false;
      }
    });
  }

  private addSafezonesToMap(safezones: Safezone[]): void {
    safezones.forEach(safezone => {
      const location = this.locations.find(l => l.id === safezone.location_id);
      if (location) {
        const mapEntity: MapEntity = {
          id: safezone.id,
          type: 'SAFE_ZONE',
          latitude: location.latitude,
          longitude: location.longitude,
          data: {
            name: safezone.name,
            zone_type: safezone.zone_type,
            location: location.name,
            created_at: safezone.created_at
          },
          timestamp: new Date(safezone.created_at).getTime()
        };
        
        // Haritaya safezone entity'sini ekle
        this.mapWebSocketService.updateMapEntityManually(mapEntity);
      }
    });
    

  }

  loadLocations(): void {
    // This would typically load from a locations service
    // For now, creating mock data
    this.locations = [
      { id: 1, name: 'Merkez Park', latitude: 39.9334, longitude: 32.8597, created_at: new Date() },
      { id: 2, name: 'Şehir Meydanı', latitude: 39.9208, longitude: 32.8541, created_at: new Date() },
      { id: 3, name: 'Üniversite Kampüsü', latitude: 39.9623, longitude: 32.8598, created_at: new Date() }
    ];
  }

  filterSafezones(): void {
    this.filteredSafezones = this.safezones.filter(safezone => {
      const typeMatch = !this.selectedZoneType || safezone.zone_type === this.selectedZoneType;
      
      const searchMatch = !this.searchTerm || 
        safezone.name.toLowerCase().includes(this.searchTerm.toLowerCase());
      
      return typeMatch && searchMatch;
    });
    
    this.sortSafezones();
  }

  sortSafezones(): void {
    if (!this.filteredSafezones || this.filteredSafezones.length === 0) return;
    
    this.filteredSafezones.sort((a, b) => {
      switch (this.sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        
        case 'created_at':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        
        case 'zone_type':
          return a.zone_type.localeCompare(b.zone_type);
        
        default:
          return 0;
      }
    });
  }

  clearFilters(): void {
    this.selectedZoneType = '';
    this.searchTerm = '';
    this.filterSafezones();
  }

  clearZoneTypeFilter(): void {
    this.selectedZoneType = '';
    this.filterSafezones();
  }

  clearSearchFilter(): void {
    this.searchTerm = '';
    this.filterSafezones();
  }

  hasActiveFilters(): boolean {
    return !!(this.selectedZoneType || this.searchTerm);
  }

  getSafezonesByType(type: ZoneType): Safezone[] {
    return this.safezones.filter(s => s.zone_type === type);
  }

  getTotalCapacity(): number {
    // This would calculate total capacity from safezone data
    // For now, returning a mock value
    return this.safezones.length * 100;
  }

  getLocationName(locationId: number): string {
    const location = this.locations.find(l => l.id === locationId);
    return location ? location.name : `Konum #${locationId}`;
  }

  toggleMapView(): void {
    this.isMapView = !this.isMapView;
  }

  centerMap(): void {
    // This would center the map on the default location
    console.log('Harita merkezlendi');
  }

  centerMapOnLocation(locationId: number): void {
    // This would center the map on the specific location
    const location = this.locations.find(l => l.id === locationId);
    if (location) {
      console.log(`Harita ${location.name} konumuna merkezlendi:`, location.latitude, location.longitude);
    }
  }

  getZoneTypeLabel(zoneType: ZoneType): string {
    const labels: { [key in ZoneType]: string } = {
      [ZoneType.TOPLANMA_ALANI]: 'Toplanma Alanı',
      [ZoneType.YARDIM_DAGITIM]: 'Yardım Dağıtım'
    };
    return labels[zoneType] || zoneType;
  }

  isAdmin(): boolean {
    const currentUser = this.authService.getCurrentUser();
    return currentUser?.role === UserRole.YONETICI;
  }
}
