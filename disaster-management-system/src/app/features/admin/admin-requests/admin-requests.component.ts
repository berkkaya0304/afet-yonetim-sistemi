import { Component, OnInit, OnDestroy, AfterViewInit, ElementRef, ViewChild, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { NotificationService } from '../../../core/services/notification.service';
import { AdminService, HelpRequest } from '../../../core/services/admin.service';
import { User, UserRole } from '../../../core/models/user.model';
import { Subscription } from 'rxjs';
import * as L from 'leaflet';

// Extended interface for map functionality
interface HelpRequestWithLocation extends HelpRequest {
  title: string;
  description: string;
  location: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
}

@Component({
  selector: 'app-admin-requests',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="min-h-screen bg-gray-100">
      <header class="bg-white shadow">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="py-6">
            <div class="flex items-center justify-between">
              <div>
                <h1 class="text-3xl font-bold text-gray-900">Talep Yönetimi</h1>
                <p class="text-gray-600 mt-2">Yardım taleplerini yönetin, doğrulayın ve önceliklendirin</p>
              </div>
              <div class="flex space-x-3">
                <button 
                  (click)="toggleView()" 
                  class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  {{ isMapView ? 'Liste Görünümü' : 'Harita Görünümü' }}
                </button>
                <button 
                  (click)="bulkValidateRequests()" 
                  class="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                >
                  Toplu Doğrula
                </button>
                <button 
                  (click)="bulkPrioritizeRequests()" 
                  class="px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 transition-colors"
                >
                  Toplu Önceliklendir
                </button>
                <button 
                  (click)="refreshRequests()" 
                  class="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
                >
                  Yenile
                </button>
                <button 
                  (click)="exportRequestData()" 
                  class="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
                >
                  Veri Dışa Aktar
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <!-- Filters and Search -->
        <div class="bg-white shadow rounded-lg p-6 mb-6">
          <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Durum</label>
              <select [(ngModel)]="filters.status" (change)="applyFilters()" class="w-full px-3 py-2 border border-gray-300 rounded-md">
                <option value="">Tümü</option>
                <option value="PENDING">Beklemede</option>
                <option value="ASSIGNED">Atandı</option>
                <option value="IN_PROGRESS">Devam Ediyor</option>
                <option value="COMPLETED">Tamamlandı</option>
                <option value="CANCELLED">İptal Edildi</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Öncelik</label>
              <select [(ngModel)]="filters.priority" (change)="applyFilters()" class="w-full px-3 py-2 border border-gray-300 rounded-md">
                <option value="">Tümü</option>
                <option value="LOW">Düşük</option>
                <option value="MEDIUM">Orta</option>
                <option value="HIGH">Yüksek</option>
                <option value="URGENT">Acil</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Talep Türü</label>
              <select [(ngModel)]="filters.type" (change)="applyFilters()" class="w-full px-3 py-2 border border-gray-300 rounded-md">
                <option value="">Tümü</option>
                <option value="MEDICAL">Tıbbi Yardım</option>
                <option value="FOOD">Gıda Yardımı</option>
                <option value="SHELTER">Barınma</option>
                <option value="TRANSPORT">Ulaşım</option>
                <option value="RESCUE">Kurtarma</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Arama</label>
              <input 
                type="text" 
                [(ngModel)]="filters.search" 
                (input)="applyFilters()"
                placeholder="Talep açıklamasında ara..."
                class="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
            </div>
          </div>
        </div>

        <!-- Statistics -->
        <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div class="bg-white shadow rounded-lg p-6">
            <div class="flex items-center">
              <div class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <div class="ml-4">
                <p class="text-sm font-medium text-gray-600">Toplam Talep</p>
                <p class="text-2xl font-bold text-gray-900">{{ statistics.total }}</p>
              </div>
            </div>
          </div>
          <div class="bg-white shadow rounded-lg p-6">
            <div class="flex items-center">
              <div class="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <svg class="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div class="ml-4">
                <p class="text-sm font-medium text-gray-600">Bekleyen</p>
                <p class="text-2xl font-bold text-gray-900">{{ statistics.pending }}</p>
              </div>
            </div>
          </div>
          <div class="bg-white shadow rounded-lg p-6">
            <div class="flex items-center">
              <div class="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <svg class="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <div class="ml-4">
                <p class="text-sm font-medium text-gray-600">Acil</p>
                <p class="text-2xl font-bold text-gray-900">{{ statistics.urgent }}</p>
              </div>
            </div>
          </div>
          <div class="bg-white shadow rounded-lg p-6">
            <div class="flex items-center">
              <div class="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div class="ml-4">
                <p class="text-sm font-medium text-gray-600">Tamamlanan</p>
                <p class="text-2xl font-bold text-gray-900">{{ statistics.completed }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- List View -->
        @if (!isMapView) {
          <div class="bg-white shadow rounded-lg">
            <div class="px-6 py-4 border-b border-gray-200">
              <h2 class="text-lg font-semibold text-gray-900">Yardım Talepleri</h2>
            </div>
            <div class="overflow-x-auto">
              <table class="min-w-full divide-y divide-gray-200">
                <thead class="bg-gray-50">
                  <tr>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Talep</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Durum</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acil Durum</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Konum</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tarih</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">İşlemler</th>
                  </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200">
                  @for (request of filteredRequests; track request.id) {
                    <tr class="hover:bg-gray-50">
                      <td class="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div class="text-sm font-medium text-gray-900">{{ request.title }}</div>
                          <div class="text-sm text-gray-500">{{ request.description }}</div>
                        </div>
                      </td>
                      <td class="px-6 py-4 whitespace-nowrap">
                        <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                              [ngClass]="{
                                'bg-yellow-100 text-yellow-800': request.status === 'PENDING',
                                'bg-blue-100 text-blue-800': request.status === 'ASSIGNED',
                                'bg-orange-100 text-orange-800': request.status === 'IN_PROGRESS',
                                'bg-green-100 text-green-800': request.status === 'COMPLETED',
                                'bg-red-100 text-red-800': request.status === 'CANCELLED'
                              }">
                          {{ getStatusLabel(request.status) }}
                        </span>
                      </td>
                      <td class="px-6 py-4 whitespace-nowrap">
                        <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                              [ngClass]="{
                                'bg-green-100 text-green-800': request.priority === 'LOW',
                                'bg-yellow-100 text-yellow-800': request.priority === 'MEDIUM',
                                'bg-orange-100 text-orange-800': request.priority === 'HIGH',
                                'bg-red-100 text-red-800': request.priority === 'URGENT'
                              }">
                          {{ getPriorityLabel(request.priority) }}
                        </span>
                      </td>
                      <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {{ request.location }}
                      </td>
                      <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {{ request.createdAt | date:'dd/MM/yyyy HH:mm' }}
                      </td>
                      <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div class="flex space-x-2">
                          @if (request.status === 'PENDING') {
                            <button 
                              (click)="validateRequest(request.id)" 
                              class="text-green-600 hover:text-green-900"
                              title="Doğrula"
                            >
                              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                              </svg>
                            </button>
                            <button 
                              (click)="prioritizeRequest(request.id)" 
                              class="text-orange-600 hover:text-orange-900"
                              title="Önceliklendir"
                            >
                              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                              </svg>
                            </button>
                            <button 
                              (click)="rejectRequest(request.id)" 
                              class="text-red-600 hover:text-red-900"
                              title="Reddet"
                            >
                              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          }
                          @if (request.status === 'ASSIGNED' || request.status === 'IN_PROGRESS') {
                            <button 
                              (click)="assignRequest(request.id)" 
                              class="text-blue-600 hover:text-blue-900"
                              title="Ata"
                            >
                              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                              </svg>
                            </button>
                          }
                          <button 
                            (click)="viewRequestDetails(request.id)" 
                            class="text-gray-600 hover:text-gray-900"
                            title="Detayları Görüntüle"
                          >
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          </div>
        }

        <!-- Map View -->
        @if (isMapView) {
          <div class="bg-white shadow rounded-lg p-6">
            <div class="mb-4">
              <h3 class="text-lg font-semibold text-gray-900 mb-2">Harita Kontrolleri</h3>
              <div class="flex space-x-4">
                <button 
                  (click)="centerMap()" 
                  class="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm"
                >
                  Haritayı Ortala
                </button>
                <button 
                  (click)="toggleHeatmap()" 
                  class="px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors text-sm"
                  [class.bg-green-800]="showHeatmap"
                >
                  {{ showHeatmap ? 'Isı Haritasını Kapat' : 'Isı Haritasını Aç' }}
                </button>
                <button 
                  (click)="exportMap()" 
                  class="px-3 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors text-sm"
                >
                  Haritayı Dışa Aktar
                </button>
              </div>
            </div>
            
            <!-- Map Container -->
            <div class="relative">
              <div #mapContainer class="w-full h-[600px] bg-gray-100 rounded-lg"></div>
              
              <!-- Loading Overlay -->
              @if (isLoading) {
                <div class="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-20 rounded-lg">
                  <div class="text-center">
                    <div class="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
                    <p class="text-gray-600">Harita yükleniyor...</p>
                  </div>
                </div>
              }
            </div>
            
            <!-- Map Legend -->
            <div class="mt-4 p-4 bg-gray-50 rounded-lg">
              <h4 class="text-sm font-semibold text-gray-900 mb-3">Harita Açıklaması</h4>
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
          </div>
        }
      </main>
    </div>
  `
})
export class AdminRequestsComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('mapContainer', { static: false }) mapContainer!: ElementRef;
  
  currentUser: User | null = null;
  isMapView = false;
  isLoading = false;
  
  requests: HelpRequestWithLocation[] = [];
  filteredRequests: HelpRequestWithLocation[] = [];
  
  // Map properties
  private map!: L.Map;
  private markers: Map<string, L.Marker> = new Map();
  private heatmapLayer?: L.LayerGroup;
  public showHeatmap = false;
  
  filters = {
    status: '',
    priority: '',
    type: '',
    search: ''
  };

  statistics = {
    total: 0,
    pending: 0,
    urgent: 0,
    completed: 0
  };

  private subscriptions = new Subscription();

  constructor(
    private authService: AuthService,
    private notificationService: NotificationService,
    private adminService: AdminService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    this.loadRequests();
  }

  ngAfterViewInit(): void {
    // Initialize map when component is ready
    setTimeout(() => {
      if (this.isMapView) {
        this.initializeMap();
      }
    }, 100);
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
    if (this.map) {
      this.map.remove();
    }
  }

  toggleView(): void {
    this.isMapView = !this.isMapView;
    if (this.isMapView) {
      setTimeout(() => {
        this.initializeMap();
      }, 100);
    } else {
      if (this.map) {
        this.map.remove();
      }
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
    
    // Color based on priority and status
    if (request.status === 'COMPLETED') {
      color = '#10b981'; // Green for completed
    } else if (request.priority === 'URGENT') {
      color = '#ef4444'; // Red for urgent
    } else if (request.priority === 'HIGH') {
      color = '#f59e0b'; // Yellow for high
    } else if (request.priority === 'MEDIUM') {
      color = '#3b82f6'; // Blue for medium
    } else {
      color = '#10b981'; // Green for low
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
          <div class="w-3 h-3 rounded-full" style="background-color: ${this.getPriorityColor(request.priority)}"></div>
          <h3 class="font-semibold text-gray-900">${request.title}</h3>
        </div>
        <p class="text-sm text-gray-700 mb-2">${request.description}</p>
        <div class="space-y-1 text-xs text-gray-600">
          <div><strong>Durum:</strong> ${this.getStatusLabel(request.status)}</div>
          <div><strong>Öncelik:</strong> ${this.getPriorityLabel(request.priority)}</div>
          <div><strong>Konum:</strong> ${request.location}</div>
          <div><strong>Talep Eden:</strong> ${request.requesterName}</div>
          <div><strong>Tarih:</strong> ${new Date(request.createdAt).toLocaleDateString('tr-TR')}</div>
        </div>
        <div class="mt-3 pt-2 border-t border-gray-200">
          <div class="flex space-x-2">
            @if (request.status === 'PENDING') {
              <button 
                onclick="window.parent.postMessage({type: 'validateRequest', id: '${request.id}'}, '*')"
                class="flex-1 bg-green-600 text-white text-xs px-3 py-1 rounded hover:bg-green-700"
              >
                Doğrula
              </button>
              <button 
                onclick="window.parent.postMessage({type: 'rejectRequest', id: '${request.id}'}, '*')"
                class="flex-1 bg-red-600 text-white text-xs px-3 py-1 rounded hover:bg-red-700"
              >
                Reddet
              </button>
            }
          </div>
        </div>
      </div>
    `;
  }

  private getPriorityColor(priority: string): string {
    switch (priority) {
      case 'URGENT':
        return '#ef4444';
      case 'HIGH':
        return '#f59e0b';
      case 'MEDIUM':
        return '#3b82f6';
      case 'LOW':
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
    this.notificationService.showInfo('Isı haritası özelliği yakında eklenecek!');
  }

  exportMap(): void {
    // Implement map export functionality
    console.log('Exporting map...');
    this.notificationService.showInfo('Harita dışa aktarma özelliği yakında eklenecek!');
  }

  refreshRequests(): void {
    this.loadRequests();
  }

  applyFilters(): void {
    this.filteredRequests = this.requests.filter(request => {
      if (this.filters.status && request.status !== this.filters.status) return false;
      if (this.filters.priority && request.priority !== this.filters.priority) return false;
      if (this.filters.type && request.title !== this.filters.type) return false;
      if (this.filters.search && !request.description?.toLowerCase().includes(this.filters.search.toLowerCase())) return false;
      return true;
    });
    this.updateStatistics();
    
    // Update map markers if in map view
    if (this.isMapView && this.map) {
      this.updateMapMarkers();
    }
  }

  validateRequest(requestId: string): void {
    this.adminService.updateHelpRequestStatus(requestId, 'ASSIGNED').subscribe({
      next: () => {
        this.notificationService.showSuccess('Talep doğrulandı!');
        this.loadRequests();
      },
      error: (error: any) => {
        console.error('Error validating request:', error);
        this.notificationService.showError('Talep doğrulanırken hata oluştu!');
      }
    });
  }

  prioritizeRequest(requestId: string): void {
    this.adminService.updateHelpRequestStatus(requestId, 'IN_PROGRESS').subscribe({
      next: () => {
        this.notificationService.showSuccess('Talep önceliklendirildi!');
        this.loadRequests();
      },
      error: (error: any) => {
        console.error('Error prioritizing request:', error);
        this.notificationService.showError('Talep önceliklendirilirken hata oluştu!');
      }
    });
  }

  rejectRequest(requestId: string): void {
    this.adminService.updateHelpRequestStatus(requestId, 'CANCELLED').subscribe({
      next: () => {
        this.notificationService.showSuccess('Talep reddedildi!');
        this.loadRequests();
      },
      error: (error: any) => {
        console.error('Error rejecting request:', error);
        this.notificationService.showError('Talep reddedilirken hata oluştu!');
      }
    });
  }

  assignRequest(requestId: string): void {
    // In a real app, this would open a modal to select a volunteer
    this.notificationService.showSuccess('Gönüllü atama özelliği yakında eklenecek!');
  }

  viewRequestDetails(requestId: string): void {
    // In a real app, this would navigate to a detailed view
    this.notificationService.showInfo('Detay görünümü yakında eklenecek!');
  }

  // New advanced features
  bulkValidateRequests(): void {
    const pendingRequests = this.requests.filter(r => r.status === 'PENDING');
    if (pendingRequests.length === 0) {
      this.notificationService.showInfo('Doğrulanacak talep bulunamadı!');
      return;
    }
    
    if (confirm(`${pendingRequests.length} talebi doğrulamak istediğinizden emin misiniz?`)) {
      pendingRequests.forEach(request => {
        request.status = 'ASSIGNED';
      });
      this.applyFilters();
      this.updateStatistics();
      this.notificationService.showSuccess(`${pendingRequests.length} talep doğrulandı!`);
    }
  }

  bulkPrioritizeRequests(): void {
    const pendingRequests = this.requests.filter(r => r.status === 'PENDING');
    if (pendingRequests.length === 0) {
      this.notificationService.showInfo('Önceliklendirilecek talep bulunamadı!');
      return;
    }
    
    if (confirm(`${pendingRequests.length} talebi önceliklendirmek istediğinizden emin misiniz?`)) {
      pendingRequests.forEach(request => {
        request.status = 'IN_PROGRESS';
      });
      this.applyFilters();
      this.updateStatistics();
      this.notificationService.showSuccess(`${pendingRequests.length} talep önceliklendirildi!`);
    }
  }

  exportRequestData(): void {
    const csvContent = this.generateRequestCSVContent();
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `yardim_talepleri_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    this.notificationService.showSuccess('Talep verileri dışa aktarıldı!');
  }

  private generateRequestCSVContent(): string {
    const headers = ['ID', 'Başlık', 'Açıklama', 'Durum', 'Öncelik', 'Konum', 'Talep Eden', 'Oluşturulma Tarihi'];
    const rows = this.requests.map(r => [
      r.id,
      r.title,
      r.description,
      this.getStatusLabel(r.status),
      this.getPriorityLabel(r.priority),
      r.location,
      r.requesterName,
      r.createdAt.toLocaleDateString('tr-TR')
    ]);
    
    return [headers, ...rows].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
  }

  private loadRequests(): void {
    this.isLoading = true;
    console.log('Loading help requests...');
    
    const subscription = this.adminService.getHelpRequests().subscribe({
      next: (requests: any[]) => { // Changed from HelpRequest[] to any[] to match API response
        console.log('Raw requests from API:', requests);
        console.log('First request sample:', requests[0]);
        
        this.requests = this.normalizeHelpRequests(requests);
        console.log('Normalized requests:', this.requests);
        console.log('First normalized request:', this.requests[0]);
        
        this.filteredRequests = this.requests;
        this.updateStatistics();
        this.isLoading = false;
        
        // Update map if in map view
        if (this.isMapView && this.map) {
          this.updateMapMarkers();
        }
      },
      error: (error: any) => {
        console.error('Error loading requests:', error);
        this.notificationService.showError('Talepler yüklenirken hata oluştu!');
        // Load mock data for demo
        this.loadMockRequests();
        this.isLoading = false;
      }
    });
    this.subscriptions.add(subscription);
  }

  private normalizeHelpRequests(requests: any[]): HelpRequestWithLocation[] {
    return requests.map(request => {
      // Convert API response to expected format
      const normalizedRequest: HelpRequestWithLocation = {
        id: request.id.toString(),
        title: this.getRequestTitle(request.requestType, request.details),
        description: request.details || 'Açıklama belirtilmemiş',
        status: this.mapStatus(request.status),
        priority: this.mapUrgency(request.urgency),
        location: this.getLocationFromCoordinates(request.latitude, request.longitude),
        latitude: request.latitude,
        longitude: request.longitude,
        requesterId: request.requesterId.toString(),
        requesterName: `Kullanıcı #${request.requesterId}`,
        createdAt: new Date(request.createdAt),
        updatedAt: new Date(request.createdAt)
      };
      
      console.log('Normalized request:', normalizedRequest);
      return normalizedRequest;
    });
  }

  private getRequestTitle(requestType: string, details: string): string {
    const typeLabels: { [key: string]: string } = {
      'SU': 'Su Yardımı',
      'GIDA': 'Gıda Yardımı',
      'TIBSI': 'Tıbbi Yardım',
      'ENKAZ': 'Enkaz Kurtarma',
      'BARINMA': 'Barınma Yardımı'
    };
    
    const typeLabel = typeLabels[requestType] || requestType;
    return `${typeLabel} - ${details.substring(0, 30)}${details.length > 30 ? '...' : ''}`;
  }

  private mapStatus(status: string): 'PENDING' | 'ASSIGNED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' {
    const statusMap: { [key: string]: 'PENDING' | 'ASSIGNED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' } = {
      'BEKLEMEDE': 'PENDING',
      'ONAYLANDI': 'ASSIGNED',
      'ATANMIS': 'IN_PROGRESS',
      'TAMAMLANDI': 'COMPLETED',
      'REDDEDILDI': 'CANCELLED'
    };
    return statusMap[status] || 'PENDING';
  }

  private mapUrgency(urgency: string): 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT' {
    const urgencyMap: { [key: string]: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT' } = {
      'DUSUK': 'LOW',
      'ORTA': 'MEDIUM',
      'YUKSEK': 'HIGH'
    };
    return urgencyMap[urgency] || 'MEDIUM';
  }

  private getLocationFromCoordinates(lat: number, lng: number): string {
    // This would normally reverse geocode the coordinates
    // For now, return a formatted coordinate string
    return `Koordinat: ${lat.toFixed(4)}, ${lng.toFixed(4)}`;
  }

  private getMockLatitude(id: string): number {
    // Generate mock latitude for Turkey (35-42 degrees)
    return 35 + (parseInt(id) % 7) + Math.random();
  }

  private getMockLongitude(id: string): number {
    // Generate mock longitude for Turkey (26-45 degrees)
    return 26 + (parseInt(id) % 19) + Math.random();
  }

  private loadMockRequests(): void {
    this.requests = [
      {
        id: '1',
        title: 'Acil Tıbbi Yardım',
        description: 'Acil tıbbi yardım gerekli, yaralı var',
        status: 'PENDING',
        priority: 'URGENT',
        location: 'Kadıköy, İstanbul',
        latitude: 40.9909,
        longitude: 29.0303,
        requesterId: 'user1',
        requesterName: 'Ahmet Yılmaz',
        createdAt: new Date(Date.now() - 30 * 60 * 1000),
        updatedAt: new Date(Date.now() - 30 * 60 * 1000)
      } as HelpRequestWithLocation,
      {
        id: '2',
        title: 'Gıda Yardımı',
        description: 'Gıda yardımı gerekli, 50 kişi',
        status: 'ASSIGNED',
        priority: 'HIGH',
        location: 'Beşiktaş, İstanbul',
        latitude: 41.0422,
        longitude: 29.0083,
        requesterId: 'user2',
        requesterName: 'Mehmet Demir',
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000)
      } as HelpRequestWithLocation,
      {
        id: '3',
        title: 'Barınma İhtiyacı',
        description: 'Barınma ihtiyacı, aile 4 kişi',
        status: 'IN_PROGRESS',
        priority: 'MEDIUM',
        location: 'Şişli, İstanbul',
        latitude: 41.0602,
        longitude: 28.9877,
        requesterId: 'user3',
        requesterName: 'Fatma Kaya',
        createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 4 * 60 * 60 * 1000)
      } as HelpRequestWithLocation,
      {
        id: '4',
        title: 'Ulaşım Yardımı',
        description: 'Hastaneye ulaşım gerekli',
        status: 'COMPLETED',
        priority: 'LOW',
        location: 'Bakırköy, İstanbul',
        latitude: 40.9819,
        longitude: 28.8772,
        requesterId: 'user4',
        requesterName: 'Ali Özkan',
        createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 6 * 60 * 60 * 1000)
      } as HelpRequestWithLocation
    ];
    this.filteredRequests = this.requests;
    this.updateStatistics();
  }

  private updateStatistics(): void {
    this.statistics = {
      total: this.requests.length,
      pending: this.requests.filter(r => r.status === 'PENDING').length,
      urgent: this.requests.filter(r => r.priority === 'URGENT').length,
      completed: this.requests.filter(r => r.status === 'COMPLETED').length
    };
  }

  getStatusLabel(status: string): string {
    const labels: { [key: string]: string } = {
      'PENDING': 'Beklemede',
      'ASSIGNED': 'Atandı',
      'IN_PROGRESS': 'Devam Ediyor',
      'COMPLETED': 'Tamamlandı',
      'CANCELLED': 'İptal Edildi'
    };
    return labels[status] || status;
  }

  getPriorityLabel(priority: string): string {
    const labels: { [key: string]: string } = {
      'LOW': 'Düşük',
      'MEDIUM': 'Orta',
      'HIGH': 'Yüksek',
      'URGENT': 'Acil'
    };
    return labels[priority] || priority;
  }
}
