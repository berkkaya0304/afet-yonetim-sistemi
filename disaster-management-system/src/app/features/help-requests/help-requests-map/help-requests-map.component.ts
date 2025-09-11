import { Component, OnInit, OnDestroy, AfterViewInit, ElementRef, ViewChild, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';
import { HelpRequestsService } from '../../../core/services/help-requests.service';
import { HelpRequest, RequestStatus, RequestType, UrgencyLevel, DisasterType } from '../../../core/models/help-request.model';
import { AuthService } from '../../../core/services/auth.service';
import { User, UserRole } from '../../../core/models/user.model';
import * as L from 'leaflet';

// Extended interface for map functionality
interface HelpRequestWithLocation extends HelpRequest {
  latitude?: number;
  longitude?: number;
}

@Component({
  selector: 'app-help-requests-map',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <!-- Header -->
      <header class="bg-white shadow-sm border-b border-gray-200">
        <div class="container-responsive">
          <div class="flex flex-col sm:flex-row sm:justify-between sm:items-center py-4 sm:py-6 space-y-4 sm:space-y-0">
            <div>
              <h1 class="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900">Yardım Talepleri Haritası</h1>
              <p class="text-gray-600 mt-1">Yardım taleplerini harita üzerinde görüntüle ve yönet</p>
            </div>
            <div class="flex space-x-3">
              <button 
                routerLink="/help-requests"
                class="btn-outline text-sm px-4 py-2.5"
              >
                <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                Liste Görünümü
              </button>
              <button 
                routerLink="/help-requests/create"
                class="btn-primary text-sm px-4 py-2.5"
              >
                <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Yeni Talep Oluştur
              </button>
            </div>
          </div>
        </div>
      </header>

      <!-- Main Content -->
      <main class="container-responsive section-padding">
        <!-- Filters -->
        <div class="card p-4 sm:p-6 mb-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">Harita Filtreleri</h3>
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <div class="form-group">
              <label class="form-label">Durum</label>
              <select 
                [(ngModel)]="selectedStatus" 
                (change)="filterRequests()"
                class="form-input"
              >
                <option value="">Tüm Durumlar</option>
                <option [value]="RequestStatus.BEKLEMEDE">Bekliyor</option>
                <option [value]="RequestStatus.ONAYLANDI">Onaylandı</option>
                <option [value]="RequestStatus.ATANMIS">Atandı</option>
                <option [value]="RequestStatus.TAMAMLANDI">Tamamlandı</option>
                <option [value]="RequestStatus.REDDEDILDI">Reddedildi</option>
              </select>
            </div>

            <div class="form-group">
              <label class="form-label">Tür</label>
              <select 
                [(ngModel)]="selectedType" 
                (change)="filterRequests()"
                class="form-input"
              >
                <option value="">Tüm Türler</option>
                <option [value]="RequestType.GIDA">Gıda</option>
                <option [value]="RequestType.SU">Su</option>
                <option [value]="RequestType.TIBSI">Tıbbi</option>
                <option [value]="RequestType.ENKAZ">Enkaz</option>
                <option [value]="RequestType.BARINMA">Barınma</option>
              </select>
            </div>

            <div class="form-group">
              <label class="form-label">Aciliyet</label>
              <select 
                [(ngModel)]="selectedUrgency" 
                (change)="filterRequests()"
                class="form-input"
              >
                <option value="">Tüm Seviyeler</option>
                <option [value]="UrgencyLevel.DUSUK">Düşük</option>
                <option [value]="UrgencyLevel.ORTA">Orta</option>
                <option [value]="UrgencyLevel.YUKSEK">Yüksek</option>
              </select>
            </div>

            <div class="form-group">
              <label class="form-label">Afet Türü</label>
              <select 
                [(ngModel)]="selectedDisasterType" 
                (change)="filterRequests()"
                class="form-input"
              >
                <option value="">Tüm Afetler</option>
                <option [value]="DisasterType.DEPREM">Deprem</option>
                <option [value]="DisasterType.SEL">Sel</option>
                <option [value]="DisasterType.CIG">Çığ</option>
                <option [value]="DisasterType.FIRTINA">Fırtına</option>
              </select>
            </div>

            <div class="form-group">
              <label class="form-label">Görünüm</label>
              <select 
                [(ngModel)]="selectedView" 
                (change)="updateMapView()"
                class="form-input"
              >
                <option value="all">Tüm Talepler</option>
                <option value="pending">Bekleyen</option>
                <option value="urgent">Acil</option>
                <option value="completed">Tamamlanan</option>
              </select>
            </div>
          </div>

          <!-- Active Filters Display -->
          @if (hasActiveFilters()) {
            <div class="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <div class="flex flex-wrap items-center gap-2">
                <span class="text-sm font-medium text-blue-800">Aktif Filtreler:</span>
                @if (selectedStatus) {
                  <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    Durum: {{ getStatusLabel(selectedStatus) }}
                    <button (click)="clearStatusFilter()" class="ml-1 text-blue-600 hover:text-blue-800">×</button>
                  </span>
                }
                @if (selectedType) {
                  <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Tür: {{ getRequestTypeLabel(selectedType) }}
                    <button (click)="clearTypeFilter()" class="ml-1 text-green-600 hover:text-green-800">×</button>
                  </span>
                }
                @if (selectedUrgency) {
                  <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                    Aciliyet: {{ getUrgencyLabel(selectedUrgency) }}
                    <button (click)="clearUrgencyFilter()" class="ml-1 text-yellow-600 hover:text-yellow-800">×</button>
                  </span>
                }
                @if (selectedDisasterType) {
                  <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                    Afet: {{ getDisasterTypeLabel(selectedDisasterType) }}
                    <button (click)="clearDisasterTypeFilter()" class="ml-1 text-purple-600 hover:text-purple-800">×</button>
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

        <!-- Map Stats -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div class="card p-4 text-center">
            <div class="text-2xl font-bold text-blue-600">{{ filteredRequests.length }}</div>
            <div class="text-sm text-gray-600">Toplam Talep</div>
          </div>
          <div class="card p-4 text-center">
            <div class="text-2xl font-bold text-yellow-600">{{ getUrgentCount() }}</div>
            <div class="text-sm text-gray-600">Acil Talep</div>
          </div>
          <div class="card p-4 text-center">
            <div class="text-2xl font-bold text-green-600">{{ getCompletedCount() }}</div>
            <div class="text-sm text-gray-600">Tamamlanan</div>
          </div>
          <div class="card p-4 text-center">
            <div class="text-2xl font-bold text-red-600">{{ getPendingCount() }}</div>
            <div class="text-sm text-gray-600">Bekleyen</div>
          </div>
        </div>

        <!-- Map Container -->
        <div class="card p-0 overflow-hidden">
          <div class="relative">
            <!-- Map Controls -->
            <div class="absolute top-4 right-4 z-10 flex flex-col space-y-2">
              <button 
                (click)="centerMap()" 
                class="bg-white p-2 rounded-lg shadow-lg hover:bg-gray-50 transition-colors"
                title="Haritayı Ortala"
              >
                <svg class="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </button>
              <button 
                (click)="toggleHeatmap()" 
                class="bg-white p-2 rounded-lg shadow-lg hover:bg-gray-50 transition-colors"
                [class.bg-blue-100]="showHeatmap"
                title="Isı Haritası"
              >
                <svg class="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </button>
              <button 
                (click)="exportMap()" 
                class="bg-white p-2 rounded-lg shadow-lg hover:bg-gray-50 transition-colors"
                title="Haritayı Dışa Aktar"
              >
                <svg class="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </button>
            </div>

            <!-- Map -->
            <div #mapContainer class="w-full h-[600px] bg-gray-100"></div>
            
            <!-- Loading Overlay -->
            @if (isLoading) {
              <div class="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-20">
                <div class="text-center">
                  <div class="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
                  <p class="text-gray-600">Harita yükleniyor...</p>
                </div>
              </div>
            }
          </div>
        </div>

        <!-- Legend -->
        <div class="card p-4 mt-6">
          <h4 class="text-lg font-semibold text-gray-900 mb-4">Harita Açıklaması</h4>
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div class="flex items-center space-x-2">
              <div class="w-4 h-4 bg-red-500 rounded-full"></div>
              <span class="text-sm text-gray-700">Acil (Yüksek)</span>
            </div>
            <div class="flex items-center space-x-2">
              <div class="w-4 h-4 bg-yellow-500 rounded-full"></div>
              <span class="text-sm text-gray-700">Orta</span>
            </div>
            <div class="flex items-center space-x-2">
              <div class="w-4 h-4 bg-green-500 rounded-full"></div>
              <span class="text-sm text-gray-700">Düşük</span>
            </div>
            <div class="flex items-center space-x-2">
              <div class="w-4 h-4 bg-blue-500 rounded-full"></div>
              <span class="text-sm text-gray-700">Tamamlanan</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  `,
  styles: [`
    .container-responsive {
      @apply max-w-7xl mx-auto px-4 sm:px-6 lg:px-8;
    }
    
    .section-padding {
      @apply py-6 sm:py-8;
    }
    
    .card {
      @apply bg-white rounded-lg shadow-sm border border-gray-200;
    }
    
    .form-group {
      @apply space-y-1;
    }
    
    .form-label {
      @apply block text-sm font-medium text-gray-700;
    }
    
    .form-input {
      @apply w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500;
    }
    
    .btn-primary {
      @apply inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500;
    }
    
    .btn-outline {
      @apply inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500;
    }
  `]
})
export class HelpRequestsMapComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('mapContainer', { static: false }) mapContainer!: ElementRef;
  
  helpRequests: HelpRequestWithLocation[] = [];
  filteredRequests: HelpRequestWithLocation[] = [];
  isLoading = false;
  
  // Filters
  selectedStatus: RequestStatus | '' = '';
  selectedType: RequestType | '' = '';
  selectedUrgency: UrgencyLevel | '' = '';
  selectedDisasterType: DisasterType | '' = '';
  selectedView: string = 'all';
  
  // Map
  private map!: L.Map;
  private markers: Map<number, L.Marker> = new Map();
  private heatmapLayer?: L.LayerGroup;
  public showHeatmap = false;
  
  // Enums
  RequestStatus = RequestStatus;
  RequestType = RequestType;
  UrgencyLevel = UrgencyLevel;
  DisasterType = DisasterType;
  
  private subscriptions: Subscription[] = [];

  constructor(
    private helpRequestsService: HelpRequestsService,
    private authService: AuthService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadHelpRequests();
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.initializeMap();
    }, 100);
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
    if (this.map) {
      this.map.remove();
    }
  }

  private initializeMap(): void {
    if (!this.mapContainer) return;

    // Türkiye'nin merkezi koordinatları
    const turkeyCenter: [number, number] = [39.9334, 32.8597];
    
    this.map = L.map(this.mapContainer.nativeElement, {
      center: turkeyCenter,
      zoom: 6,
      zoomControl: false,
      attributionControl: false
    });
    
    // OpenStreetMap tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 18,
      minZoom: 3
    }).addTo(this.map);

    // Custom zoom controls
    this.addCustomZoomControls();
    
    // Map click event
    this.map.on('click', (e: L.LeafletMouseEvent) => {
      const { lat, lng } = e.latlng;
      console.log(`Haritaya tıklandı: ${lat}, ${lng}`);
    });

    this.updateMapMarkers();
  }

  private addCustomZoomControls(): void {
    // Zoom in
    const zoomInButton = L.Control.extend({
      options: { position: 'topright' },
      onAdd: () => {
        const div = L.DomUtil.create('div', 'bg-white p-2 rounded-lg shadow-lg cursor-pointer hover:bg-gray-50');
        div.innerHTML = '<span class="text-lg font-bold text-gray-700">+</span>';
        div.onclick = () => this.map.zoomIn();
        return div;
      }
    });
    new zoomInButton().addTo(this.map);

    // Zoom out
    const zoomOutButton = L.Control.extend({
      options: { position: 'topright' },
      onAdd: () => {
        const div = L.DomUtil.create('div', 'bg-white p-2 rounded-lg shadow-lg cursor-pointer hover:bg-gray-50');
        div.innerHTML = '<span class="text-lg font-bold text-gray-700">−</span>';
        div.onclick = () => this.map.zoomOut();
        return div;
      }
    });
    new zoomOutButton().addTo(this.map);
  }

  loadHelpRequests(): void {
    this.isLoading = true;
    this.helpRequestsService.getHelpRequests().subscribe({
      next: (requests) => {
        this.helpRequests = this.normalizeHelpRequests(requests);
        this.filteredRequests = this.helpRequests;
        this.isLoading = false;
        this.updateMapMarkers();
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Yardım talepleri yüklenirken hata oluştu:', error);
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  private normalizeHelpRequests(requests: HelpRequest[]): HelpRequestWithLocation[] {
    return requests.map(request => ({
      ...request,
      status: this.normalizeStatus(request.status),
      request_type: this.normalizeRequestType(request.request_type),
      urgency: this.normalizeUrgency(request.urgency),
      disaster_type: request.disaster_type ? this.normalizeDisasterType(request.disaster_type) : undefined,
      // Add mock coordinates for demonstration - in real app, these would come from location_id
      latitude: this.getMockLatitude(request.id),
      longitude: this.getMockLongitude(request.id)
    }));
  }

  private getMockLatitude(id: number): number {
    // Generate mock latitude for Turkey (35-42 degrees)
    return 35 + (id % 7) + Math.random();
  }

  private getMockLongitude(id: number): number {
    // Generate mock longitude for Turkey (26-45 degrees)
    return 26 + (id % 19) + Math.random();
  }

  private normalizeStatus(status: any): RequestStatus {
    const statusStr = status?.toString()?.toLowerCase();
    switch (statusStr) {
      case 'beklemede':
      case 'bekliyor':
      case 'pending':
        return RequestStatus.BEKLEMEDE;
      case 'onaylandi':
      case 'onaylandı':
      case 'approved':
        return RequestStatus.ONAYLANDI;
      case 'atanmis':
      case 'atandı':
      case 'assigned':
        return RequestStatus.ATANMIS;
      case 'tamamlandi':
      case 'tamamlandı':
      case 'completed':
        return RequestStatus.TAMAMLANDI;
      case 'reddedildi':
      case 'rejected':
        return RequestStatus.REDDEDILDI;
      default:
        return RequestStatus.BEKLEMEDE;
    }
  }

  private normalizeRequestType(type: any): RequestType {
    const typeStr = type?.toString()?.toLowerCase();
    switch (typeStr) {
      case 'gida':
      case 'gıda':
      case 'food':
        return RequestType.GIDA;
      case 'su':
      case 'water':
        return RequestType.SU;
      case 'tibsi':
      case 'tıbbi':
      case 'medical':
        return RequestType.TIBSI;
      case 'enkaz':
      case 'debris':
        return RequestType.ENKAZ;
      case 'barinma':
      case 'shelter':
        return RequestType.BARINMA;
      default:
        return RequestType.GIDA;
    }
  }

  private normalizeUrgency(urgency: any): UrgencyLevel {
    const urgencyStr = urgency?.toString()?.toLowerCase();
    switch (urgencyStr) {
      case 'dusuk':
      case 'düşük':
      case 'low':
        return UrgencyLevel.DUSUK;
      case 'orta':
      case 'medium':
        return UrgencyLevel.ORTA;
      case 'yuksek':
      case 'yüksek':
      case 'high':
        return UrgencyLevel.YUKSEK;
      default:
        return UrgencyLevel.ORTA;
    }
  }

  private normalizeDisasterType(disasterType: any): DisasterType {
    const disasterStr = disasterType?.toString()?.toLowerCase();
    switch (disasterStr) {
      case 'deprem':
      case 'earthquake':
        return DisasterType.DEPREM;
      case 'sel':
      case 'flood':
        return DisasterType.SEL;
      case 'cig':
      case 'çığ':
      case 'avalanche':
        return DisasterType.CIG;
      case 'firtina':
      case 'fırtına':
      case 'storm':
        return DisasterType.FIRTINA;
      default:
        return DisasterType.DEPREM;
    }
  }

  filterRequests(): void {
    this.filteredRequests = this.helpRequests.filter(request => {
      const statusMatch = !this.selectedStatus || 
        request.status.toString().toLowerCase() === this.selectedStatus.toString().toLowerCase();
      
      const typeMatch = !this.selectedType || 
        request.request_type.toString().toLowerCase() === this.selectedType.toString().toLowerCase();
      
      const urgencyMatch = !this.selectedUrgency || 
        request.urgency.toString().toLowerCase() === this.selectedUrgency.toString().toLowerCase();
      
      const disasterMatch = !this.selectedDisasterType || 
        (request.disaster_type && 
         request.disaster_type.toString().toLowerCase() === this.selectedDisasterType.toString().toLowerCase());
      
      return statusMatch && typeMatch && urgencyMatch && disasterMatch;
    });
    
    this.updateMapMarkers();
  }

  updateMapView(): void {
    this.updateMapMarkers();
  }

  private updateMapMarkers(): void {
    if (!this.map) return;

    // Clear existing markers
    this.markers.forEach(marker => marker.remove());
    this.markers.clear();

    // Add new markers based on filtered requests
    this.filteredRequests.forEach(request => {
      if (request.latitude && request.longitude) {
        const marker = this.createMarker(request);
        this.markers.set(request.id, marker);
        marker.addTo(this.map);
      }
    });

    // Fit bounds if there are markers
    if (this.markers.size > 0) {
      const bounds = L.latLngBounds(
        Array.from(this.markers.values()).map(marker => marker.getLatLng())
      );
      this.map.fitBounds(bounds, { padding: [20, 20] });
    } else {
      // Center on Turkey if no markers
      this.map.setView([39.9334, 32.8597], 6);
    }
  }

  private createMarker(request: HelpRequestWithLocation): L.Marker {
    const icon = this.getMarkerIcon(request);
    const marker = L.marker([request.latitude!, request.longitude!], { icon });
    
    // Create popup content
    const popupContent = this.createPopupContent(request);
    marker.bindPopup(popupContent);
    
    return marker;
  }

  private getMarkerIcon(request: HelpRequestWithLocation): L.Icon {
    let color: string;
    
    // Color based on urgency and status
    if (request.status === RequestStatus.TAMAMLANDI) {
      color = '#10b981'; // Green for completed
    } else if (request.urgency === UrgencyLevel.YUKSEK) {
      color = '#ef4444'; // Red for high urgency
    } else if (request.urgency === UrgencyLevel.ORTA) {
      color = '#f59e0b'; // Yellow for medium urgency
    } else {
      color = '#10b981'; // Green for low urgency
    }

    const svg = `
      <svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="12" r="10" fill="${color}" stroke="white" stroke-width="2"/>
        <path d="M12 6v6m0 2v2" stroke="white" stroke-width="2" stroke-linecap="round"/>
        <circle cx="12" cy="4" r="1" fill="white"/>
      </svg>
    `;
    
    const dataUrl = 'data:image/svg+xml;base64,' + btoa(svg);
    
    return L.icon({
      iconUrl: dataUrl,
      iconSize: [24, 24],
      iconAnchor: [12, 24],
      popupAnchor: [0, -24]
    });
  }

  private createPopupContent(request: HelpRequestWithLocation): string {
    return `
      <div class="p-3 min-w-[250px]">
        <div class="flex items-center space-x-2 mb-2">
          <div class="w-3 h-3 rounded-full" style="background-color: ${this.getUrgencyColor(request.urgency)}"></div>
          <h3 class="font-semibold text-gray-900">Talep #${request.id}</h3>
        </div>
        <p class="text-sm text-gray-700 mb-2">${request.details}</p>
        <div class="space-y-1 text-xs text-gray-600">
          <div><strong>Tür:</strong> ${this.getRequestTypeLabel(request.request_type)}</div>
          <div><strong>Aciliyet:</strong> ${this.getUrgencyLabel(request.urgency)}</div>
          <div><strong>Durum:</strong> ${this.getStatusLabel(request.status)}</div>
          ${request.disaster_type ? `<div><strong>Afet:</strong> ${this.getDisasterTypeLabel(request.disaster_type)}</div>` : ''}
          <div><strong>Tarih:</strong> ${new Date(request.created_at).toLocaleDateString('tr-TR')}</div>
        </div>
        <div class="mt-3 pt-2 border-t border-gray-200">
          <button 
            onclick="window.open('/help-requests/${request.id}', '_blank')"
            class="w-full bg-blue-600 text-white text-xs px-3 py-1 rounded hover:bg-blue-700"
          >
            Detayları Gör
          </button>
        </div>
      </div>
    `;
  }

  private getUrgencyColor(urgency: UrgencyLevel): string {
    switch (urgency) {
      case UrgencyLevel.YUKSEK:
        return '#ef4444';
      case UrgencyLevel.ORTA:
        return '#f59e0b';
      case UrgencyLevel.DUSUK:
        return '#10b981';
      default:
        return '#6b7280';
    }
  }

  centerMap(): void {
    if (this.markers.size > 0) {
      const bounds = L.latLngBounds(
        Array.from(this.markers.values()).map(marker => marker.getLatLng())
      );
      this.map.fitBounds(bounds, { padding: [20, 20] });
    } else {
      this.map.setView([39.9334, 32.8597], 6);
    }
  }

  toggleHeatmap(): void {
    this.showHeatmap = !this.showHeatmap;
    // Implement heatmap functionality
    console.log('Heatmap toggled:', this.showHeatmap);
  }

  exportMap(): void {
    // Implement map export functionality
    console.log('Exporting map...');
  }

  // Filter methods
  clearFilters(): void {
    this.selectedStatus = '';
    this.selectedType = '';
    this.selectedUrgency = '';
    this.selectedDisasterType = '';
    this.filterRequests();
  }

  clearStatusFilter(): void {
    this.selectedStatus = '';
    this.filterRequests();
  }

  clearTypeFilter(): void {
    this.selectedType = '';
    this.filterRequests();
  }

  clearUrgencyFilter(): void {
    this.selectedUrgency = '';
    this.filterRequests();
  }

  clearDisasterTypeFilter(): void {
    this.selectedDisasterType = '';
    this.filterRequests();
  }

  hasActiveFilters(): boolean {
    return !!(this.selectedStatus || this.selectedType || this.selectedUrgency || this.selectedDisasterType);
  }

  // Count methods
  getUrgentCount(): number {
    return this.filteredRequests.filter(r => r.urgency === UrgencyLevel.YUKSEK).length;
  }

  getCompletedCount(): number {
    return this.filteredRequests.filter(r => r.status === RequestStatus.TAMAMLANDI).length;
  }

  getPendingCount(): number {
    return this.filteredRequests.filter(r => r.status === RequestStatus.BEKLEMEDE).length;
  }

  // Label methods
  getStatusLabel(status: RequestStatus | string): string {
    const statusStr = status.toString().toLowerCase();
    const labels: { [key: string]: string } = {
      'beklemede': 'Bekliyor',
      'onaylandi': 'Onaylandı',
      'atanmis': 'Atandı',
      'tamamlandi': 'Tamamlandı',
      'reddedildi': 'Reddedildi'
    };
    return labels[statusStr] || status.toString();
  }

  getRequestTypeLabel(type: RequestType | string): string {
    const typeStr = type.toString().toLowerCase();
    const labels: { [key: string]: string } = {
      'gida': 'Gıda',
      'su': 'Su',
      'tibsi': 'Tıbbi',
      'enkaz': 'Enkaz',
      'barinma': 'Barınma'
    };
    return labels[typeStr] || type.toString();
  }

  getUrgencyLabel(urgency: UrgencyLevel | string): string {
    const urgencyStr = urgency.toString().toLowerCase();
    const labels: { [key: string]: string } = {
      'dusuk': 'Düşük',
      'orta': 'Orta',
      'yuksek': 'Yüksek'
    };
    return labels[urgencyStr] || urgency.toString();
  }

  getDisasterTypeLabel(disasterType: DisasterType | string): string {
    const disasterStr = disasterType.toString().toLowerCase();
    const labels: { [key: string]: string } = {
      'deprem': 'Deprem',
      'sel': 'Sel',
      'cig': 'Çığ',
      'firtina': 'Fırtına'
    };
    return labels[disasterStr] || disasterType.toString();
  }
}
