import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { HelpRequestsService } from '../../../core/services/help-requests.service';
import { HelpRequest, RequestStatus, RequestType, UrgencyLevel, DisasterType } from '../../../core/models/help-request.model';
import { AuthService } from '../../../core/services/auth.service';
import { User, UserRole } from '../../../core/models/user.model';

@Component({
  selector: 'app-help-requests-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <!-- Header -->
      <header class="bg-white shadow-sm border-b border-gray-200">
        <div class="container-responsive">
          <div class="flex flex-col sm:flex-row sm:justify-between sm:items-center py-4 sm:py-6 space-y-4 sm:space-y-0">
            <div>
              <h1 class="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900">Yardım Talepleri</h1>
              <p class="text-gray-600 mt-1">Mevcut yardım taleplerini görüntüle ve yönet</p>
            </div>
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
      </header>

      <!-- Main Content -->
      <main class="container-responsive section-padding">
        <!-- Filters -->
        <div class="card p-4 sm:p-6 mb-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">Filtreler</h3>
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div class="form-group">
              <label class="form-label">Durum</label>
              <div class="relative">
                <select 
                  [(ngModel)]="selectedStatus" 
                  (change)="filterRequests()"
                  class="form-input pr-8"
                >
                  <option value="">Tüm Durumlar</option>
                  <option [value]="RequestStatus.BEKLEMEDE">Bekliyor</option>
                  <option [value]="RequestStatus.ONAYLANDI">Onaylandı</option>
                  <option [value]="RequestStatus.ATANMIS">Atandı</option>
                  <option [value]="RequestStatus.TAMAMLANDI">Tamamlandı</option>
                  <option [value]="RequestStatus.REDDEDILDI">Reddedildi</option>
                </select>
                @if (selectedStatus) {
                  <button 
                    (click)="clearStatusFilter()"
                    class="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                }
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">Tür</label>
              <div class="relative">
                <select 
                  [(ngModel)]="selectedType" 
                  (change)="filterRequests()"
                  class="form-input pr-8"
                >
                  <option value="">Tüm Türler</option>
                  <option [value]="RequestType.GIDA">Gıda</option>
                  <option [value]="RequestType.SU">Su</option>
                  <option [value]="RequestType.TIBSI">Tıbbi</option>
                  <option [value]="RequestType.ENKAZ">Enkaz</option>
                  <option [value]="RequestType.BARINMA">Barınma</option>
                </select>
                @if (selectedType) {
                  <button 
                    (click)="clearTypeFilter()"
                    class="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                }
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">Aciliyet</label>
              <div class="relative">
                <select 
                  [(ngModel)]="selectedUrgency" 
                  (change)="filterRequests()"
                  class="form-input pr-8"
                >
                  <option value="">Tüm Seviyeler</option>
                  <option [value]="UrgencyLevel.DUSUK">Düşük</option>
                  <option [value]="UrgencyLevel.ORTA">Orta</option>
                  <option [value]="UrgencyLevel.YUKSEK">Yüksek</option>
                </select>
                @if (selectedUrgency) {
                  <button 
                    (click)="clearUrgencyFilter()"
                    class="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                }
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">Afet Türü</label>
              <div class="relative">
                <select 
                  [(ngModel)]="selectedDisasterType" 
                  (change)="filterRequests()"
                  class="form-input pr-8"
                >
                  <option value="">Tüm Afetler</option>
                  <option [value]="DisasterType.DEPREM">Deprem</option>
                  <option [value]="DisasterType.SEL">Sel</option>
                  <option [value]="DisasterType.CIG">Çığ</option>
                  <option [value]="DisasterType.FIRTINA">Fırtına</option>
                </select>
                @if (selectedDisasterType) {
                  <button 
                    (click)="clearDisasterTypeFilter()"
                    class="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                }
              </div>
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
                    <button (click)="clearTypeFilter()" class="ml-1 text-green-600 hover:text-blue-800">×</button>
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

          <!-- Mobile Filter Toggle -->
          <div class="sm:hidden mt-4">
            <button 
              (click)="toggleMobileFilters()"
              class="w-full btn-outline text-sm py-2"
            >
              <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L6.293 13H5a1 1 0 01-1-1V4z" />
              </svg>
              {{ isMobileFiltersOpen ? 'Filtreleri Gizle' : 'Filtreleri Göster' }}
            </button>
          </div>

          <!-- Mobile Filters -->
          @if (isMobileFiltersOpen) {
            <div class="sm:hidden mt-4 space-y-4">
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
                </select>
              </div>
            </div>
          }
        </div>

        <!-- Results Summary -->
        <div class="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6">
          <div class="mb-4 sm:mb-0">
            <p class="text-gray-600">
              <span class="font-semibold text-gray-900">{{ filteredRequests.length }}</span> yardım talebi bulundu
              @if (selectedStatus || selectedType || selectedUrgency || selectedDisasterType) {
                <span class="text-sm text-gray-500">
                  (filtrelenmiş)
                </span>
              }
            </p>
          </div>
          
          <div class="flex items-center space-x-3">
            @if (selectedStatus || selectedType || selectedUrgency || selectedDisasterType) {
              <button 
                (click)="clearFilters()"
                class="btn-secondary text-sm px-3 py-2"
              >
                Filtreleri Temizle
              </button>
            }
            
            <div class="flex items-center space-x-2">
              <span class="text-sm text-gray-600">Sırala:</span>
              <select 
                [(ngModel)]="sortBy" 
                (change)="sortRequests()"
                class="form-input text-sm py-2 px-3"
              >
                <option value="created_at">Oluşturulma Tarihi</option>
                <option value="urgency">Aciliyet</option>
                <option value="status">Durum</option>
              </select>
            </div>
          </div>
        </div>

        <!-- Help Requests Grid -->
        @if (filteredRequests.length > 0) {
          <div class="grid-responsive-2 xl:grid-cols-3 gap-4 sm:gap-6">
            @for (request of filteredRequests; track request.id) {
              <div class="card-hover p-6">
                <!-- Request Header -->
                <div class="flex justify-between items-start mb-4">
                  <div class="flex items-center space-x-3">
                    <div class="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                      <svg class="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                      </svg>
                    </div>
                    <div>
                      <h3 class="font-semibold text-gray-900">Talep #{{ request.id }}</h3>
                      <p class="text-sm text-gray-500">{{ request.created_at | date:'short' }}</p>
                    </div>
                  </div>
                  
                  <span class="status-badge"
                        [ngClass]="{
                          'status-pending': request.status === RequestStatus.BEKLEMEDE,
                          'status-approved': request.status === RequestStatus.ONAYLANDI,
                          'status-completed': request.status === RequestStatus.TAMAMLANDI,
                          'status-rejected': request.status === RequestStatus.REDDEDILDI
                        }">
                    {{ getStatusLabel(request.status) }}
                  </span>
                </div>

                <!-- Request Details -->
                <div class="mb-4">
                  <p class="text-gray-700 mb-3 line-clamp-3">{{ request.details }}</p>
                  
                  <!-- Tags -->
                  <div class="flex flex-wrap gap-2 mb-3">
                    <span class="bg-primary-100 text-primary-800 text-xs px-2 py-1 rounded-full font-medium">
                      {{ request.request_type }}
                    </span>
                    <span class="bg-warning-100 text-warning-800 text-xs px-2 py-1 rounded-full font-medium">
                      {{ request.urgency }}
                    </span>
                    @if (request.disaster_type) {
                      <span class="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded-full font-medium">
                        {{ request.disaster_type }}
                      </span>
                    }
                  </div>
                </div>

                <!-- Request Footer -->
                <div class="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-3 sm:space-y-0">
                  <div class="text-sm text-gray-500">
                    <span class="font-medium">Kullanıcı #{{ request.requester_id }}</span> tarafından
                  </div>
                  
                  <div class="flex space-x-2">
                    <button 
                      [routerLink]="['/help-requests', request.id]"
                      class="btn-outline text-sm px-3 py-2"
                    >
                      Detayları Gör
                    </button>
                    
                    @if (isAdmin() && request.status === RequestStatus.BEKLEMEDE) {
                      <button 
                        (click)="approveRequest(request.id)"
                        class="btn-success text-sm px-3 py-2"
                      >
                        Onayla
                      </button>
                    }
                  </div>
                </div>
              </div>
            }
          </div>
        }

        <!-- Empty State -->
        @if (filteredRequests.length === 0) {
          <div class="text-center py-12">
            <div class="w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
              <svg class="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 class="text-lg font-medium text-gray-900 mb-2">Yardım talebi bulunamadı</h3>
            <p class="text-gray-600 mb-6">
              {{ selectedStatus || selectedType || selectedUrgency || selectedDisasterType 
                 ? 'Seçilen filtrelere uygun yardım talebi bulunamadı. Filtreleri değiştirmeyi deneyin.' 
                 : 'Henüz yardım talebi oluşturulmamış.' }}
            </p>
            <button 
              routerLink="/help-requests/create"
              class="btn-primary"
            >
              İlk Yardım Talebini Oluştur
            </button>
          </div>
        }

        <!-- Loading State -->
        @if (isLoading) {
          <div class="text-center py-12">
            <div class="w-16 h-16 mx-auto mb-4 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
            <p class="text-gray-600">Yardım talepleri yükleniyor...</p>
          </div>
        }
      </main>
    </div>
  `,
  styles: [`
    .line-clamp-3 {
      display: -webkit-box;
      -webkit-line-clamp: 3;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
  `]
})
export class HelpRequestsListComponent implements OnInit {
  helpRequests: HelpRequest[] = [];
  filteredRequests: HelpRequest[] = [];
  isLoading = false;
  
  // Filters
  selectedStatus: RequestStatus | '' = '';
  selectedType: RequestType | '' = '';
  selectedUrgency: UrgencyLevel | '' = '';
  selectedDisasterType: DisasterType | '' = '';
  
  // Sorting
  sortBy = 'created_at';
  
  // Mobile
  isMobileFiltersOpen = false;
  
  // Enums
  RequestStatus = RequestStatus;
  RequestType = RequestType;
  UrgencyLevel = UrgencyLevel;
  DisasterType = DisasterType;

  constructor(
    private helpRequestsService: HelpRequestsService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadHelpRequests();
  }

  loadHelpRequests(): void {
    this.isLoading = true;
    this.helpRequestsService.getHelpRequests().subscribe({
      next: (requests) => {
        this.helpRequests = this.normalizeHelpRequests(requests);
        this.filteredRequests = this.helpRequests;
        this.isLoading = false;
        
        // Refresh filters if any are active
        if (this.hasActiveFilters()) {
          this.filterRequests();
        }
      },
      error: (error) => {
        console.error('Yardım talepleri yüklenirken hata oluştu:', error);
        this.isLoading = false;
      }
    });
  }

  // Normalize the data to ensure consistent enum values
  private normalizeHelpRequests(requests: HelpRequest[]): HelpRequest[] {
    return requests.map(request => ({
      ...request,
      status: this.normalizeStatus(request.status),
      request_type: this.normalizeRequestType(request.request_type),
      urgency: this.normalizeUrgency(request.urgency),
      disaster_type: request.disaster_type ? this.normalizeDisasterType(request.disaster_type) : undefined
    }));
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

  // Override the filter function to add more debugging
  filterRequests(): void {
    this.filteredRequests = this.helpRequests.filter(request => {
      // Status filter - use case-insensitive comparison
      const statusMatch = !this.selectedStatus || 
        request.status.toString().toLowerCase() === this.selectedStatus.toString().toLowerCase();
      
      // Type filter - use case-insensitive comparison
      const typeMatch = !this.selectedType || 
        request.request_type.toString().toLowerCase() === this.selectedType.toString().toLowerCase();
      
      // Urgency filter - use case-insensitive comparison
      const urgencyMatch = !this.selectedUrgency || 
        request.urgency.toString().toLowerCase() === this.selectedUrgency.toString().toLowerCase();
      
      // Disaster type filter - use case-insensitive comparison
      const disasterMatch = !this.selectedDisasterType || 
        (request.disaster_type && 
         request.disaster_type.toString().toLowerCase() === this.selectedDisasterType.toString().toLowerCase());
      
      // All filters must match
      return statusMatch && typeMatch && urgencyMatch && disasterMatch;
    });
    
    // Apply sorting after filtering
    this.sortRequests();
  }

  sortRequests(): void {
    if (!this.filteredRequests || this.filteredRequests.length === 0) return;
    
    this.filteredRequests.sort((a, b) => {
      switch (this.sortBy) {
        case 'created_at':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        
        case 'urgency':
          const urgencyOrder = { 
            [UrgencyLevel.YUKSEK]: 3, 
            [UrgencyLevel.ORTA]: 2, 
            [UrgencyLevel.DUSUK]: 1 
          };
          return urgencyOrder[b.urgency] - urgencyOrder[a.urgency];
        
        case 'status':
          const statusOrder = { 
            [RequestStatus.BEKLEMEDE]: 1, 
            [RequestStatus.ONAYLANDI]: 2, 
            [RequestStatus.ATANMIS]: 3, 
            [RequestStatus.TAMAMLANDI]: 4, 
            [RequestStatus.REDDEDILDI]: 5 
          };
          return statusOrder[a.status] - statusOrder[b.status];
        
        default:
          return 0;
      }
    });
  }

  clearFilters(): void {
    this.selectedStatus = '';
    this.selectedType = '';
    this.selectedUrgency = '';
    this.selectedDisasterType = '';
    this.filterRequests();
  }

  // Individual filter clear functions
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

  // Check if any filters are active
  hasActiveFilters(): boolean {
    return !!(this.selectedStatus || this.selectedType || this.selectedUrgency || this.selectedDisasterType);
  }

  toggleMobileFilters(): void {
    this.isMobileFiltersOpen = !this.isMobileFiltersOpen;
  }

  approveRequest(requestId: number): void {
    // Implementation for approving requests
  }

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

  isAdmin(): boolean {
    const currentUser = this.authService.getCurrentUser();
    return currentUser?.role === UserRole.YONETICI;
  }
}

